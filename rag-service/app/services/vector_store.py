"""Vector storage service using ChromaDB."""

import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

logger = logging.getLogger(__name__)


class VectorStoreError(Exception):
    """Custom exception for vector store operations."""
    pass


class VectorStore:
    """Service for storing and retrieving document embeddings using ChromaDB."""
    
    def __init__(self, collection_name: str = None):
        """
        Initialize the vector store.
        
        Args:
            collection_name: Name of the ChromaDB collection (defaults to settings)
        """
        self.collection_name = collection_name or settings.chromadb_collection_name
        self.collection = None
        
        # Initialize ChromaDB client
        # For local development, use persistent client
        try:
            self.client = chromadb.PersistentClient(path="./chroma_db")
            logger.info("Initialized ChromaDB persistent client")
        except Exception as e:
            logger.warning(f"Failed to initialize persistent client: {e}. Falling back to in-memory client.")
            try:
                self.client = chromadb.Client()
            except Exception as client_error:
                logger.error(f"Failed to initialize ChromaDB client: {client_error}")
                self.client = None
                return
        
        # Get or create collection
        try:
            self.collection = self._get_or_create_collection()
            logger.info(f"Initialized VectorStore with collection={self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize collection: {e}")
            self.collection = None
    
    def _get_or_create_collection(self):
        """
        Get existing collection or create new one.
        
        Returns:
            ChromaDB collection instance
        """
        try:
            collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Document chunks for RAG system"}
            )
            logger.info(f"Using collection '{self.collection_name}' with {collection.count()} documents")
            return collection
        except Exception as e:
            raise VectorStoreError(f"Failed to get or create collection: {str(e)}")
    
    def add_documents(
        self,
        chunks: List[Dict[str, Any]],
        document_id: str,
        document_title: str
    ) -> int:
        """
        Add document chunks to the vector store.
        
        Args:
            chunks: List of chunk dictionaries with 'text', 'embedding', and metadata
            document_id: Unique identifier for the document
            document_title: Title of the document
            
        Returns:
            Number of chunks successfully added
            
        Raises:
            VectorStoreError: If adding documents fails
        """
        if self.collection is None:
            raise VectorStoreError("Vector store is not initialized")
        
        if not chunks:
            logger.warning("No chunks provided to add")
            return 0
        
        logger.info(f"Adding {len(chunks)} chunks for document {document_id}")
        
        try:
            # Prepare data for ChromaDB
            ids = []
            embeddings = []
            documents = []
            metadatas = []
            
            for chunk in chunks:
                # Create unique ID for each chunk
                chunk_id = f"{document_id}_chunk_{chunk.get('chunk_index', 0)}"
                ids.append(chunk_id)
                
                # Extract embedding
                embedding = chunk.get('embedding')
                if not embedding:
                    logger.warning(f"Chunk {chunk_id} missing embedding, skipping")
                    continue
                embeddings.append(embedding)
                
                # Extract text
                text = chunk.get('text', '')
                documents.append(text)
                
                # Prepare metadata
                metadata = {
                    'document_id': document_id,
                    'document_title': document_title,
                    'chunk_index': chunk.get('chunk_index', 0),
                    'total_chunks': chunk.get('total_chunks', len(chunks)),
                    'page_number': chunk.get('metadata', {}).get('page_number', 0),
                    'token_count': chunk.get('token_count', 0)
                }
                metadatas.append(metadata)
            
            if not embeddings:
                raise VectorStoreError("No valid embeddings found in chunks")
            
            # Add to collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            
            logger.info(f"Successfully added {len(embeddings)} chunks to vector store")
            
            return len(embeddings)
            
        except Exception as e:
            logger.error(f"Failed to add documents to vector store: {str(e)}")
            raise VectorStoreError(f"Failed to add documents: {str(e)}")
    
    def search(
        self,
        query_embedding: List[float],
        top_k: int = None,
        filter_metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using embedding.
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of results to return (defaults to settings)
            filter_metadata: Optional metadata filters
            
        Returns:
            List of search results with documents, metadata, and distances
            
        Raises:
            VectorStoreError: If search fails
        """
        if self.collection is None:
            raise VectorStoreError("Vector store is not initialized")
        
        if not query_embedding:
            raise VectorStoreError("Query embedding cannot be empty")
        
        top_k = top_k or settings.top_k_results
        
        logger.info(f"Searching for top {top_k} similar documents")
        
        try:
            # Perform similarity search
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filter_metadata
            )
            
            # Format results
            formatted_results = []
            
            if results and results.get('ids') and len(results['ids']) > 0:
                ids = results['ids'][0]
                documents = results.get('documents', [[]])[0]
                metadatas = results.get('metadatas', [[]])[0]
                distances = results.get('distances', [[]])[0]
                
                # Use absolute values for distances to handle negative values
                distances = [abs(d) for d in distances]
                
                # Find max distance for normalization (ensure it's positive and non-zero)
                max_distance = max(distances) if distances else 1.0
                max_distance = max(abs(max_distance), 0.001)  # Ensure positive and non-zero
                
                for i in range(len(ids)):
                    distance = abs(distances[i]) if i < len(distances) else 0.0
                    # Normalize distance to 0-1 range
                    normalized_distance = min(distance / max_distance, 1.0)
                    # Convert to similarity score and clamp to valid range [0.0, 1.0]
                    relevance = max(0.0, min(1.0 - normalized_distance, 1.0))
                    
                    result = {
                        'id': ids[i],
                        'document': documents[i] if i < len(documents) else '',
                        'metadata': metadatas[i] if i < len(metadatas) else {},
                        'distance': distance,
                        'relevance': relevance
                    }
                    formatted_results.append(result)
            
            logger.info(f"Found {len(formatted_results)} similar documents")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise VectorStoreError(f"Search failed: {str(e)}")
    
    def delete_document(self, document_id: str) -> int:
        """
        Delete all chunks for a specific document.
        
        Args:
            document_id: ID of the document to delete
            
        Returns:
            Number of chunks deleted
            
        Raises:
            VectorStoreError: If deletion fails
        """
        if self.collection is None:
            raise VectorStoreError("Vector store is not initialized")
        
        logger.info(f"Deleting document {document_id} from vector store")
        
        try:
            # Query for all chunks of this document
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if not results or not results.get('ids'):
                logger.warning(f"No chunks found for document {document_id}")
                return 0
            
            chunk_ids = results['ids']
            
            # Delete the chunks
            self.collection.delete(ids=chunk_ids)
            
            logger.info(f"Deleted {len(chunk_ids)} chunks for document {document_id}")
            
            return len(chunk_ids)
            
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            raise VectorStoreError(f"Failed to delete document: {str(e)}")
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all chunks for a specific document.
        
        Args:
            document_id: ID of the document
            
        Returns:
            List of chunks with metadata
            
        Raises:
            VectorStoreError: If retrieval fails
        """
        if self.collection is None:
            raise VectorStoreError("Vector store is not initialized")
        
        logger.info(f"Retrieving chunks for document {document_id}")
        
        try:
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if not results or not results.get('ids'):
                logger.warning(f"No chunks found for document {document_id}")
                return []
            
            chunks = []
            ids = results['ids']
            documents = results.get('documents', [])
            metadatas = results.get('metadatas', [])
            
            for i in range(len(ids)):
                chunk = {
                    'id': ids[i],
                    'text': documents[i] if i < len(documents) else '',
                    'metadata': metadatas[i] if i < len(metadatas) else {}
                }
                chunks.append(chunk)
            
            logger.info(f"Retrieved {len(chunks)} chunks for document {document_id}")
            
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to retrieve document chunks: {str(e)}")
            raise VectorStoreError(f"Failed to retrieve chunks: {str(e)}")
    
    def count_documents(self) -> int:
        """
        Get total number of chunks in the collection.
        
        Returns:
            Total chunk count
        """
        if self.collection is None:
            logger.error("Collection is not initialized")
            return 0
        
        try:
            count = self.collection.count()
            logger.info(f"Collection contains {count} chunks")
            return count
        except Exception as e:
            logger.error(f"Failed to count documents: {str(e)}")
            return 0
    
    def check_connection(self) -> bool:
        """
        Check if ChromaDB is accessible.
        
        Returns:
            True if connection is successful, False otherwise
        """
        if self.collection is None:
            logger.error("Collection is not initialized")
            return False
        
        try:
            # Try to count documents as a connection check
            self.collection.count()
            logger.info("Successfully connected to ChromaDB")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to ChromaDB: {str(e)}")
            return False
    
    def clear_collection(self) -> bool:
        """
        Clear all documents from the collection.
        WARNING: This deletes all data!
        
        Returns:
            True if successful, False otherwise
        """
        if self.collection is None:
            logger.error("Collection is not initialized")
            return False
        
        try:
            logger.warning(f"Clearing all documents from collection {self.collection_name}")
            
            # Get all IDs
            results = self.collection.get()
            if results and results.get('ids'):
                self.collection.delete(ids=results['ids'])
                logger.info(f"Cleared {len(results['ids'])} documents from collection")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear collection: {str(e)}")
            return False
