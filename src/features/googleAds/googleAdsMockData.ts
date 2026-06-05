export interface GoogleAdsCampaign {
  id: number;
  status: 'eligible' | 'paused';
  name: string;
  budget: string;
  statusText: string;
  statusWarning: string;
  optimizationScore: string;
  campaignType: string;
  impr: string;
  interac: string;
  interactionRate: string;
  avgCost: string;
  cost: string;
  allConv: string;
  ctr: string;
  bidStrategy: string;
  convRate: string;
  convValue: string;
  conversions: string;
  costConv: string;
}

export const mockCampaigns: GoogleAdsCampaign[] = [
  {
    id: 1,
    status: 'eligible',
    name: 'Sales- Ads',
    budget: '₹1,000.00/day',
    statusText: 'Eligible (Limited)',
    statusWarning: 'Limited by budget',
    optimizationScore: '-',
    campaignType: 'Performance Max',
    impr: '48,871',
    interac: '5,982 clicks, engagements',
    interactionRate: '12.24%',
    avgCost: '₹0.26',
    cost: '₹1,579.28',
    allConv: '10,821.31',
    ctr: '12.17%',
    bidStrategy: 'Maximize conversions (Target CPA)',
    convRate: '174.82%',
    convValue: '15,673,696.50',
    conversions: '10,449.16',
    costConv: '₹0.15'
  },
  {
    id: 2,
    status: 'paused',
    name: 'Search-1',
    budget: '₹500.00/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Search',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversions (Target CPA)',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 3,
    status: 'paused',
    name: 'Sales-Performance Max-July',
    budget: '₹650.00/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Performance Max',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value (Target ROAS)',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 4,
    status: 'paused',
    name: 'Website traffic Search 2026',
    budget: '₹500.00/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Search',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value (Target ROAS)',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 5,
    status: 'paused',
    name: 'Performance Max-all_products',
    budget: '₹593.75/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Performance Max',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 6,
    status: 'paused',
    name: 'KS_AWARNESS_DSP',
    budget: '₹200.00/day',
    statusText: 'Paused\nAll ads limited by policy',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Display',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversions',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 7,
    status: 'paused',
    name: 'web_traffic_search_KON',
    budget: '₹500.00/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Search',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value (Target ROAS)',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 8,
    status: 'paused',
    name: 'Display Jan Awareness 2026',
    budget: '₹500.00/day',
    statusText: 'Paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Display',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  },
  {
    id: 9,
    status: 'paused',
    name: 'sales2026',
    budget: '₹250.00/day',
    statusText: 'Paused\nAll asset groups are paused',
    statusWarning: '',
    optimizationScore: '-',
    campaignType: 'Performance Max',
    impr: '0',
    interac: '0',
    interactionRate: '-',
    avgCost: '-',
    cost: '₹0.00',
    allConv: '0.00',
    ctr: '0.00%',
    bidStrategy: 'Maximize conversion value',
    convRate: '0.00%',
    convValue: '0.00',
    conversions: '0.00',
    costConv: '₹0.00'
  }
];
