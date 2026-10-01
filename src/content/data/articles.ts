import type { Article } from "@/lib/content/schema";

export const articlesVi = [
  {
    slug: "drone-giao-duc-stem",
    title: "Drone trong lớp học STEM và nghiên cứu ứng dụng",
    date: "2026-07-05",
    summary:
      "Drone giúp lớp học STEM và lab nghiên cứu chuyển từ bài giảng lý thuyết sang thử nghiệm kỹ thuật có dữ liệu và kết quả quan sát được.",
    category: "STEM & R&D",
    readingTime: "4 phút đọc",
    content:
      "Drone giúp lớp học STEM có một vật thể thật để học sinh quan sát, lập trình, thử nghiệm và cải tiến. Ở đại học, cùng nền tảng đó có thể mở rộng thành bài toán computer vision, dữ liệu bay, cảm biến và tự động hóa. Thay vì chỉ học thuật toán trên màn hình, người học thấy lệnh điều khiển tạo ra chuyển động, sai số và dữ liệu phản hồi.\n\nMột tiết học hoặc buổi lab drone hiệu quả cần ba lớp nội dung: an toàn bay, tư duy lập trình và nhiệm vụ thực hành. Với cấp 1, nhiệm vụ có thể là bay qua cổng hoặc đi theo mê cung. Với cấp 2 và cấp 3, nhiệm vụ có thể mở rộng sang tọa độ, cảm biến, dữ liệu bay và mô phỏng ứng dụng thực tế. Với đại học, trọng tâm chuyển sang thiết kế thí nghiệm, logging dữ liệu và đánh giá thuật toán.\n\nGiá trị lớn nhất của drone trong nghiên cứu và giáo dục không nằm ở thiết bị riêng lẻ. Giá trị nằm ở hệ sinh thái gồm drone phù hợp cấp học, giáo trình có cấu trúc, checklist an toàn, hoạt động nhóm, rubric đánh giá và protocol thử nghiệm có thể tái lập.",
  },
  {
    slug: "giao-trinh-drone-theo-cap-hoc",
    title: "Thiết kế giáo trình drone từ cấp 1 đến đại học",
    date: "2026-07-04",
    summary:
      "Giáo trình drone cần thay đổi theo độ tuổi và năng lực kỹ thuật, từ trải nghiệm an toàn ở cấp 1 đến lab dữ liệu, AI và tự động hóa ở đại học.",
    category: "Giáo trình",
    readingTime: "5 phút đọc",
    content:
      "Giáo trình drone theo cấp học phải bắt đầu từ năng lực thật của người học. Ở cấp 1, bài học nên ngắn, trực quan và tập trung vào an toàn, quan sát chuyển động, điều khiển cơ bản. Ở cấp 2, học sinh có thể học thuật toán, tọa độ, vòng lặp, điều kiện và thử nghiệm nhiệm vụ bay.\n\nỞ cấp 3, drone trở thành nền tảng cho dự án ứng dụng. Học sinh có thể làm việc với dữ liệu bay, cảm biến, camera, nhận diện vật thể và báo cáo quyết định kỹ thuật. Ở đại học, chương trình cần đi sâu vào SDK, telemetry, protocol thử nghiệm, computer vision và đánh giá thuật toán. Giảng viên cần rubric rõ để đánh giá cả quá trình thử nghiệm, không chỉ kết quả bay cuối cùng.\n\nMột bộ giáo trình hoàn chỉnh nên đi kèm thiết bị, slide, phiếu học tập, hướng dẫn giáo viên/giảng viên, checklist an toàn, protocol lab và đề xuất cách tổ chức lớp học hoặc phòng nghiên cứu.",
  },
] satisfies Article[];

export const articlesEn = [
  {
    slug: "drone-stem-research",
    title: "Drones in STEM classrooms and applied research",
    date: "2026-07-05",
    summary:
      "Drones help STEM classrooms and research labs move from theory to technical experiments with observable data.",
    category: "STEM & R&D",
    readingTime: "4 min read",
    content:
      "Drones give STEM classrooms a physical system learners can observe, program, test, and improve. In university labs, the same platform can expand into computer vision, flight data, sensors, and automation.\n\nAn effective drone lesson or lab needs three layers: flight safety, programming thinking, and practical missions. Younger learners can fly through gates or mazes. Older learners can work with coordinates, sensors, flight data, and real-world mission simulation.\n\nThe real value is not the drone alone. The value is the ecosystem: suitable hardware, structured curriculum, safety checklists, teamwork, assessment rubrics, and repeatable experiment protocols.",
  },
  {
    slug: "drone-curriculum-levels",
    title: "Designing drone curriculum from grade school to university",
    date: "2026-07-04",
    summary:
      "Drone curriculum should evolve from safe exploration in grade school to data, AI, and automation labs at university level.",
    category: "Curriculum",
    readingTime: "5 min read",
    content:
      "Drone curriculum should start from the real capability of learners. In grade school, lessons should be short, visual, and focused on safety, movement observation, and basic control. In middle school, learners can work with algorithms, coordinates, loops, conditions, and mission testing.\n\nIn high school, drones become a platform for applied projects. Students can work with flight data, sensors, cameras, object recognition, and technical reporting. At university level, the program should go deeper into SDKs, telemetry, experiment protocols, computer vision, and algorithm evaluation.\n\nA complete curriculum should include devices, slides, worksheets, teacher or instructor guides, safety checklists, lab protocols, and a clear class or research-room structure.",
  },
] satisfies Article[];

