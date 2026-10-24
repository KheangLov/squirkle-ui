import './styles.css'
import SqLineChart from './components/SqLineChart.vue'
import SqBarChart from './components/SqBarChart.vue'
import SqDonutChart from './components/SqDonutChart.vue'
import SqSparkline from './components/SqSparkline.vue'

export { SqLineChart, SqBarChart, SqDonutChart, SqSparkline }
export { seriesColor, smoothPath, barPath, type Series, type DonutDatum } from './utils'
export const componentNames = ['SqLineChart', 'SqBarChart', 'SqDonutChart', 'SqSparkline'] as const
