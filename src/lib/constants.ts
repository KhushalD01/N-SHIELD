import {
  LayoutDashboard,
  Map,
  EyeOff,
  Shield,
  BrainCircuit,
  Sparkles,
  Radio,
  type LucideIcon,
} from "lucide-react";

export const NAGPUR_CENTER = {
  latitude: 21.1458,
  longitude: 79.0882,
  zoom: 12.8,
  pitch: 0,
  bearing: 0,
} as const;

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    id: "live-map",
    label: "Crime Risk Map",
    icon: Map,
    description: "Google Maps crime risk intelligence",
  },
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "City-wide intelligence summary",
  },
  {
    id: "cctv-blind-spots",
    label: "CCTV Blind Spots",
    icon: EyeOff,
    description: "Coverage gap analysis",
  },
  {
    id: "deploy-forces",
    label: "Deploy Forces",
    icon: Shield,
    description: "Resource deployment matrix",
  },
  {
    id: "emergency-circle",
    label: "Emergency Circle",
    icon: Radio,
    description: "One-tap live location sharing",
  },
  {
    id: "ai-assistant",
    label: "AI Safety Assistant",
    icon: Sparkles,
    description: "Emergency & services intelligence",
  },
  {
    id: "event-predictor",
    label: "Event Predictor",
    icon: BrainCircuit,
    description: "AI incident forecasting",
  },
];
