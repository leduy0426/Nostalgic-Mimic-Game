# Hướng Dẫn Triển Khai Nền Tảng (Deployment Guide)
**Nostalgic Mini Game Platform**

---

## 1. Yêu Cầu Môi Trường
- **Node.js:** v20.x hoặc v22.x
- **Package Manager:** `pnpm` (v10+ hoặc v12+)
- **Database:** PostgreSQL (v15+)
- **Redis (Tùy chọn):** v7+

---

## 2. Khởi Chạy Local Development

1. **Khởi động Database & Cache qua Docker:**
   ```bash
   docker compose up -d
   ```
2. **Cài đặt thư viện:**
   ```bash
   pnpm install
   ```
3. **Sinh Prisma Client & Migration:**
   ```bash
   pnpm --filter @repo/database run db:generate
   pnpm --filter @repo/database run db:push
   ```
4. **Khởi chạy đồng thời Frontend & Backend:**
   ```bash
   pnpm dev
   ```
   - Giao diện Web: `http://localhost:3000`
   - WebSocket & REST API: `http://localhost:3001`

---

## 3. Triển Khai Production Lên Cloud (Khuyến Nghị Cho Đồ Án)

### A. Triển Khai Backend (Fastify + Socket.io) lên Railway / Render
1. Tạo project mới trên [Railway](https://railway.app) hoặc [Render](https://render.com).
2. Tạo PostgreSQL Database instance miễn phí trên Supabase, Neon hoặc Railway.
3. Thiết lập các biến môi trường:
   - `DATABASE_URL`: Connection string PostgreSQL
   - `JWT_SECRET`: Khóa bí mật JWT
   - `PORT`: `3001` (hoặc cổng do platform cấp)
   - `CORS_ORIGIN`: Domain production của Frontend
4. Start Command: `pnpm --filter @repo/server run start`

### B. Triển Khai Frontend (Next.js 15) lên Vercel
1. Kết nối kho lưu trữ GitHub với [Vercel](https://vercel.com).
2. Thiết lập Root Directory: `apps/web`.
3. Thiết lập biến môi trường:
   - `NEXT_PUBLIC_API_URL`: URL Backend trên Railway/Render (ví dụ: `https://api.nostalgic-game.up.railway.app`)
   - `NEXT_PUBLIC_SOCKET_URL`: URL Backend tương tự cho kết nối WebSocket.
4. Bấm **Deploy**.

