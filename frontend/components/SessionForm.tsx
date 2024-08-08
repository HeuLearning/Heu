import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function SessionForm({ index, session, setSession }) {
  const handleChange = (name, value) => {
    console.log(value);
    setSession({ ...session, index: index, [name]: value.toISOString() });
  };

  return (
    <div>
      <h3>Session {index}</h3>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Session Start Time"
          onChange={(newValue) => {
            handleChange("start_time", newValue);
          }}
        />
        <DateTimePicker
          label="Session End Time"
          onChange={(newValue) => {
            handleChange("end_time", newValue);
          }}
        />
      </LocalizationProvider>
      <br />
    </div>
  );
}
