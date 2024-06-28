export default function SessionForm({ index, session, setSession }) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSession({ ...session, index: index, [name]: value });
  };

  return (
    <div>
      <h3>Session {index}</h3>
      <form>
        <label htmlFor="date">Year (YYYY-MM-DD): </label>
        <input
          type="text"
          name="date"
          required={true}
          onChange={handleChange}
        ></input>
        <br />
        <label htmlFor="start_time">Start time hour 24-hour (HH:MM): </label>
        <input
          type="text"
          name="start_time"
          required={true}
          onChange={handleChange}
        ></input>
        <br />
        <label htmlFor="end_time">End time hour 24-hour (HH:MM): </label>
        <input
          type="text"
          name="end_time"
          required={true}
          onChange={handleChange}
        ></input>
        <br />
      </form>
      <br />
    </div>
  );
}
