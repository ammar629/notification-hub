import { Server } from "http";
import app from "./app";

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const VERSION: string = "1.0.0";

const server: Server = app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT} (v${VERSION})`);
});

export default server;