export interface Session {
  start_time: string;
  end_time: string;
  learning_organization: string;
  location: string;
  enrolled_students: string[]; // or more specific type
  waitlist_students: string[]; // or more specific type
  max_capacity: number;
}
