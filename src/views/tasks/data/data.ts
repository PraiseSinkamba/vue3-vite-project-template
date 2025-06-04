// import { h } from 'vue'
import{
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon
} from '@radix-icons/vue'
export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: QuestionMarkCircledIcon, // Just the component reference
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: CircleIcon, // Just the component reference
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: StopwatchIcon, // Just the component reference
  },
  {
    value: 'done',
    label: 'Done',
    icon: CheckCircledIcon, // Just the component reference
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CrossCircledIcon, // Just the component reference
  },
];

export const priorities = [
  {
    value: 'low',
    label: 'Low',
    icon: ArrowDownIcon, // Just the component reference
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: ArrowRightIcon, // Just the component reference
  },
  {
    value: 'high',
    label: 'High',
    icon: ArrowUpIcon, // Just the component reference
  },
];
