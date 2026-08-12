import {
  defaultCancellationPolicy,
  defaultPunctualityPolicy,
} from "@/lib/tours/options";

export interface TourFormValues {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  difficulty: string;
  location: string;
  province: string;
  meeting_point: string;
  departure_date: string;
  departure_time: string;
  return_date: string;
  return_time: string;
  deadline_date: string;
  deadline_time: string;
  duration: string;
  price: string;
  deposit_amount: string;
  capacity: string;
  minimum_age: string;
  minors_allowed: boolean;
  transport_included: boolean;
  local_guide_included: boolean;
  includes: string;
  not_includes: string;
  requirements: string;
  recommendations: string;
  inherent_risks: string;
  itinerary: string;
  punctuality_policy: string;
  cancellation_policy: string;
  status: string;
  featured: boolean;
}

export function createDefaultTourFormValues(): TourFormValues {
  return {
    title: "",
    slug: "",
    short_description: "",
    description: "",
    category: "senderismo",
    difficulty: "moderada",
    location: "",
    province: "",
    meeting_point: "",
    departure_date: "",
    departure_time: "",
    return_date: "",
    return_time: "",
    deadline_date: "",
    deadline_time: "",
    duration: "",
    price: "",
    deposit_amount: "",
    capacity: "",
    minimum_age: "",
    minors_allowed: false,
    transport_included: true,
    local_guide_included: false,
    includes: "",
    not_includes: "",
    requirements: "",
    recommendations: "",
    inherent_risks: "",
    itinerary: "",
    punctuality_policy: defaultPunctualityPolicy,
    cancellation_policy: defaultCancellationPolicy,
    status: "borrador",
    featured: false,
  };
}
