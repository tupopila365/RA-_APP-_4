import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { getNewsById, News } from '../../services/news.service';

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getNewsById(id);
      setNews(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/news');
  };

  const handleEdit = () => {
    navigate(`/news/edit/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !news) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'News article not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Back to News List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
          Edit
        </Button>
      </Box>

      <Card>
        {news.imageUrl && (
          <CardMedia
            component="img"
            height="400"
            image={news.imageUrl}
            alt={news.title}
            sx={{ objectFit: 'cover' }}
          />
        )}

        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={news.published ? 'Published' : 'Draft'}
              color={news.published ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {news.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {news.author}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {news.category}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {news.publishedAt ? formatDate(news.publishedAt) : `Created ${formatDate(news.createdAt)}`}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Excerpt
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {news.excerpt}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}
          >
            {news.content}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
            <Typography variant="caption">Created: {formatDate(news.createdAt)}</Typography>
            <Typography variant="caption">•</Typography>
            <Typography variant="caption">Last Updated: {formatDate(news.updatedAt)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewsDetail;
