export interface Lesson {
  id: string;
  start_time: string;
  end_time: string;
  max_capacity?: number;
  num_enrolled: number; // hardcoded to 80
  learning_organization_name: string; // hardcoded to "Heu Learning"
  location_name: string; // hardcoded to "Online"
}
