import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InteractionsList from './InteractionsList';
import MetricsDashboard from './MetricsDashboard';
import EnhancedMetricsDashboard from './EnhancedMetricsDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interactions-tabpanel-${index}`}
      aria-labelledby={`interactions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ChatbotInteractions = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="interactions tabs">
          <Tab label="Interactions" id="interactions-tab-0" aria-controls="interactions-tabpanel-0" />
          <Tab label="Basic Metrics" id="interactions-tab-1" aria-controls="interactions-tabpanel-1" />
          <Tab label="🚀 Enhanced Analytics" id="interactions-tab-2" aria-controls="interactions-tabpanel-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <InteractionsList />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <MetricsDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <EnhancedMetricsDashboard />
      </TabPanel>
    </Box>
  );
};

export default ChatbotInteractions;


















