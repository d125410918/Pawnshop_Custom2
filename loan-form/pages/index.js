
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    birthday: "",
    job: "",
    phone: "",
    lineId: "",
    city: "高雄市",
    district: "",
    loanAmount: "3萬以下",
    loanPurpose: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>資金需求申請</h1>

      <form onSubmit={handleSubmit}>

        <input name="name" placeholder="姓名" onChange={handleChange} required />
        <input name="birthday" placeholder="850101 / 19960101" onChange={handleChange} required />
        <input name="job" placeholder="職業" onChange={handleChange} required />
        <input name="phone" placeholder="手機" onChange={handleChange} required />
        <input name="lineId" placeholder="LINE" onChange={handleChange} />

        <select name="city" onChange={handleChange}>
          <option>高雄市</option>
          <option>台北市</option>
          <option>新北市</option>
          <option>台中市</option>
        </select>

        <input name="district" placeholder="區域" onChange={handleChange} required />

        <select name="loanAmount" onChange={handleChange}>
          <option>3萬以下</option>
          <option>4-7萬</option>
          <option>8萬以上</option>
        </select>

        <textarea name="loanPurpose" placeholder="用途" onChange={handleChange}></textarea>

        <button type="submit">送出</button>

      </form>
    </div>
  );
}
