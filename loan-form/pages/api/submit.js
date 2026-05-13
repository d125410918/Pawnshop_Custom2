
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const data = req.body;

  console.log("收到資料:", data);

  return res.status(200).json({
    message: "資料已收到",
    data
  });
}
