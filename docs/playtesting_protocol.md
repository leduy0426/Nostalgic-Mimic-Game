# Kịch Bản & Giao Thức Thử Nghiệm Người Dùng (Playtesting Protocol)
**Nostalgic Mini Game Platform — Thử Nghiệm Đánh Giá 50–100 Người Dùng**

---

## 1. Mục Tiêu Thử Nghiệm

Thu thập bằng chứng thực nghiệm để đánh giá 4 giả thuyết cốt lõi được nêu trong *Project Ideation v1.0*:
1. **Giả thuyết Thu Hút (Acquisition - Nostalgia):** Các trò chơi quen thuộc tuổi thơ (Tìm số 1–25, Caro) có tạo động lực kích thích người dùng mới thử chơi không?
2. **Giả thuyết Gắn Kết (Engagement - Quick-Play):** Lối chơi ván ngắn ($\le 2$ phút), luật chơi dễ hiểu và thao tác "Chơi Lại" tiện lợi có thúc đẩy người chơi tự nguyện chơi nhiều ván liên tiếp?
3. **Giả thuyết Giữ Chân (Retention - Avatar Progression):** Việc tích lũy XP, tăng cấp (Level) và cá nhân hóa ngoại hình Avatar có tạo lý do quay lại nền tảng?
4. **Giả thuyết Lan Tỏa (Sharing):** Thẻ kỷ lục cá nhân (Achievement Card) có thúc đẩy mong muốn chia sẻ thành tích với bạn bè?

---

## 2. Đối Tượng & Quy Mô Thử Nghiệm

- **Quy mô mục tiêu:** 50 – 100 sinh viên tại Đại học FPT và người trẻ trong độ tuổi 18 – 25.
- **Phương thức tiếp cận:** Gửi link web trực tiếp qua Zalo, Messenger, Discord hoặc quét mã QR tại khuôn viên trường. Không yêu cầu cài đặt app.

---

## 3. Chỉ Số Định Lượng Cần Đo Lường (Telemetry Metrics)

| Chỉ số (Metric) | Định nghĩa | Mục tiêu đề xuất |
|:---|:---|:---|
| **Time-to-First-Play** | Thời gian từ lúc mở web đến khi bấm số đầu tiên | $\le 10$ giây |
| **Steps-to-Start** | Số lần click chuột / chạm màn hình để bắt đầu ván | $\le 2$ thao tác |
| **Session Length** | Thời gian trung bình hoàn thành một ván Tìm số Solo | $20 - 45$ giây |
| **Voluntary Replay Rate** | Tỷ lệ người chơi bấm nút "Chơi Lại" ít nhất 1 lần | $\ge 60\%$ |
| **PvP Match Completion** | Tỷ lệ trận đấu 2 người hoàn thành trọn vẹn 25 điểm | $\ge 85\%$ |
| **Card Export Rate** | Số lượt bấm tải hoặc chia sẻ Thẻ Kỷ Lục | Theo dõi thực tế |

---

## 4. Bảng Câu Hỏi Khảo Sát Người Dùng (Sau Ván Chơi)

Khảo sát ngắn gồm 5 câu theo thang điểm Likert 5 mức độ (1 = Rất không đồng ý, 5 = Hoàn toàn đồng ý):

1. **[Nostalgia]** *"Tôi quyết định thử chơi ngay vì đây là trò chơi quen thuộc thời học sinh của tôi."*
   - [1] Rất không đồng ý • [2] Không đồng ý • [3] Bình thường • [4] Đồng ý • [5] Hoàn toàn đồng ý
2. **[Quick-Play]** *"Giao diện dễ hiểu, ván chơi nhanh gọn và tôi không phải tốn thời gian chờ đợi."*
   - [1] Rất không đồng ý • [2] Không đồng ý • [3] Bình thường • [4] Đồng ý • [5] Hoàn toàn đồng ý
3. **[Replayability]** *"Nút 'Chơi Lại' giúp tôi dễ dàng tiếp tục ván tiếp theo để cải thiện kỷ lục cá nhân."*
   - [1] Rất không đồng ý • [2] Không đồng ý • [3] Bình thường • [4] Đồng ý • [5] Hoàn toàn đồng ý
4. **[Progression]** *"Hệ thống điểm XP, tăng cấp độ và đổi phụ kiện Avatar làm tăng sự thích thú của tôi."*
   - [1] Rất không đồng ý • [2] Không đồng ý • [3] Bình thường • [4] Đồng ý • [5] Hoàn toàn đồng ý
5. **[Social PvP]** *"Chế độ đối kháng trực tiếp cùng bạn bè tạo cảm giác kịch tính và vui nhộn."*
   - [1] Rất không đồng ý • [2] Không đồng ý • [3] Bình thường • [4] Đồng ý • [5] Hoàn toàn đồng ý

---

## 5. Báo Cáo Kết Quả & Đóng Gói Hồ Sơ Học Phần

- Tổng hợp dữ liệu log từ cơ sở dữ liệu `GameSession`, `GameResult`, và `XPTransaction`.
- Thống kê tỷ lệ hoàn thành, thời gian trung bình và điểm khảo sát trung bình (Mean Likert Score).
- Đưa kết quả vào Báo cáo cuối kỳ môn học làm bằng chứng nghiệm thu Spec-Driven & Agent-Driven Development.

