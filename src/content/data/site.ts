import type { SourceContent } from "@/lib/content/schema";

export const sourceContentVi = {
  site: {
    brand: {
      name: "Drone Việt",
      tagline: "Drone research and education lab",
      description:
        "Drone Việt cung cấp giải pháp drone cho nghiên cứu và giáo dục từ cấp 1 đến đại học: thiết bị, giáo trình, tài liệu triển khai, nền tảng thử nghiệm và dịch vụ đồng hành.",
    },
    navigation: [
      { label: "Giải pháp", href: "/giai-phap" },
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Giáo trình", href: "/giao-trinh" },
      { label: "Dịch vụ", href: "/dich-vu" },
      { label: "Tin tức", href: "/tin-tuc" },
    ],
    hero: {
      eyebrow: "Drone lab cho nghiên cứu & giáo dục",
      title: "Drone cho nghiên cứu và giáo dục từ cấp 1 đến đại học",
      description:
        "Một hệ sinh thái drone giúp học sinh, sinh viên và nhóm nghiên cứu học lập trình bay, cảm biến, AI, dữ liệu thực nghiệm và an toàn hàng không qua dự án thực hành.",
      primaryCta: {
        label: "Liên hệ tư vấn ngay",
        href: "https://zalo.me/0384070636",
      },
      secondaryCta: {
        label: "Xem giáo trình và tài liệu",
        href: "/giao-trinh",
      },
      metrics: [
        { label: "Bộ drone mẫu", value: "05" },
        { label: "Bậc học", value: "Cấp 1 - Đại học" },
        { label: "Định hướng", value: "Edu + R&D" },
      ],
    },
    audiencePaths: [
      {
        name: "Trường phổ thông",
        summary:
          "Triển khai tiết học STEM, câu lạc bộ drone, phòng lab thực hành và ngày hội trải nghiệm từ cấp 1 đến cấp 3.",
        href: "/dich-vu",
      },
      {
        name: "Đại học và lab nghiên cứu",
        summary:
          "Xây dựng nền tảng drone cho đề tài AI, computer vision, IoT, tự động hóa bay và thu thập dữ liệu thực nghiệm.",
        href: "/giai-phap",
      },
      {
        name: "Trung tâm STEM",
        summary:
          "Bộ thiết bị, giáo án và chương trình đào tạo giảng viên để mở lớp drone theo cấp độ.",
        href: "/giao-trinh",
      },
    ],
    process: [
      {
        title: "Khảo sát mục tiêu học tập hoặc nghiên cứu",
        summary:
          "Xác định độ tuổi, năng lực kỹ thuật, không gian bay, dữ liệu cần thu thập và mục tiêu đầu ra.",
      },
      {
        title: "Thiết kế bộ giải pháp",
        summary:
          "Ghép thiết bị, giáo trình, tài liệu an toàn, module cảm biến và nhiệm vụ thực nghiệm thành gói triển khai rõ ràng.",
      },
      {
        title: "Đào tạo và vận hành",
        summary:
          "Hướng dẫn giáo viên, giảng viên hoặc nhóm nghiên cứu vận hành drone, bàn giao học liệu và hỗ trợ buổi triển khai đầu tiên.",
      },
    ],
  },
  drones: [
    {
      slug: "dv-primary-lab",
      name: "DV Primary Lab",
      summary:
        "Drone mini an toàn cho học sinh cấp 1, phù hợp hoạt động điều khiển, quan sát chuyển động và lập trình khối lệnh.",
      level: "Cấp 1",
      useCases: ["Lớp STEM nhập môn", "Ngày hội trải nghiệm", "Bài học an toàn bay"],
      learningOutcomes: [
        "Lập trình bay cơ bản theo khối lệnh",
        "Hiểu quy tắc an toàn trước khi cất cánh",
        "Quan sát chuyển động và phản hồi cảm biến",
      ],
      specs: [
        { label: "Thời lượng", value: "40-60 phút/buổi" },
        { label: "Nhóm học", value: "2-4 học sinh/drone" },
        { label: "Không gian", value: "Trong lớp" },
      ],
      image: "lab-grid-primary",
      featured: true,
    },
    {
      slug: "dv-code-fleet",
      name: "DV Code Fleet",
      summary:
        "Bộ drone lập trình theo đội hình cho cấp 2, dùng cho bài học thuật toán, tọa độ, thử nghiệm nhiệm vụ và teamwork.",
      level: "Cấp 2",
      useCases: ["Lập trình đội hình", "Dự án thuật toán", "Thi đấu nội bộ"],
      learningOutcomes: [
        "Thiết kế nhiệm vụ bay theo tọa độ",
        "Tối ưu thuật toán điều hướng",
        "Phối hợp nhóm trong thử nghiệm kỹ thuật",
      ],
      specs: [
        { label: "Ngôn ngữ", value: "Block/Python" },
        { label: "Mô hình", value: "Fleet 5-10 drone" },
        { label: "Chủ đề", value: "Algorithm + robotics" },
      ],
      image: "lab-grid-code",
      featured: true,
    },
    {
      slug: "dv-ai-vision",
      name: "DV AI Vision",
      summary:
        "Drone thực hành thị giác máy tính cho cấp 3, xử lý dữ liệu cảm biến và nhiệm vụ mô phỏng ứng dụng thực tế.",
      level: "Cấp 3",
      useCases: ["AI ứng dụng", "Dự án nghiên cứu học sinh", "Cuộc thi sáng tạo"],
      learningOutcomes: [
        "Thu thập và phân tích dữ liệu bay",
        "Mô phỏng bài toán nhận diện vật thể",
        "Thiết kế nhiệm vụ tự động hóa có ràng buộc",
      ],
      specs: [
        { label: "Module", value: "Camera + sensor" },
        { label: "Dữ liệu", value: "Flight logs" },
        { label: "Định hướng", value: "AI/IoT project" },
      ],
      image: "lab-grid-vision",
      featured: true,
    },
    {
      slug: "dv-research-platform",
      name: "DV Research Platform",
      summary:
        "Nền tảng drone mở cho đại học và lab nghiên cứu, phục vụ thử nghiệm thuật toán bay, computer vision, IoT và thu thập dữ liệu.",
      level: "Đại học",
      useCases: ["Lab nghiên cứu", "Computer vision", "Tự động hóa bay"],
      learningOutcomes: [
        "Thiết kế giao thức thử nghiệm có dữ liệu",
        "Tích hợp cảm biến và pipeline xử lý ảnh",
        "Đánh giá thuật toán điều hướng trong môi trường kiểm soát",
      ],
      specs: [
        { label: "SDK", value: "Python/API" },
        { label: "Module", value: "Camera + sensor bus" },
        { label: "Dữ liệu", value: "Telemetry + dataset" },
      ],
      image: "lab-grid-research",
      featured: true,
    },
    {
      slug: "dv-instructor-kit",
      name: "DV Instructor Kit",
      summary:
        "Bộ demo cho giáo viên và giảng viên với giáo án, checklist an toàn, nhiệm vụ mẫu và tài liệu đánh giá lớp học.",
      level: "Giảng viên",
      useCases: ["Tập huấn giáo viên", "Demo tiết học", "Chuẩn hóa học liệu"],
      learningOutcomes: [
        "Tổ chức lớp học drone an toàn",
        "Đánh giá sản phẩm học sinh, sinh viên theo rubric",
        "Điều phối thiết bị trong lớp hoặc lab đông người học",
      ],
      specs: [
        { label: "Tài liệu", value: "Lesson + lab pack" },
        { label: "Đào tạo", value: "1-2 ngày" },
        { label: "Hỗ trợ", value: "Remote/on-site" },
      ],
      image: "lab-grid-instructor",
      featured: false,
    },
  ],
  curriculum: [
    {
      slug: "drone-nhap-mon-cap-1",
      title: "Drone nhập môn cho cấp 1",
      level: "Cấp 1",
      format: "Giáo án 8 buổi",
      summary:
        "Học sinh làm quen với drone, quy tắc an toàn, điều khiển cơ bản và lập trình nhiệm vụ đơn giản.",
      modules: ["An toàn bay", "Điều khiển cơ bản", "Lập trình khối lệnh", "Thử thách mê cung"],
      outcomes: ["Biết vận hành an toàn", "Hoàn thành nhiệm vụ bay theo lệnh"],
      status: "Đã hoàn thành",
      downloadLabel: "Xem cấu trúc giáo án",
    },
    {
      slug: "lap-trinh-drone-cap-2",
      title: "Lập trình drone cho cấp 2",
      level: "Cấp 2",
      format: "Giáo trình 12 buổi",
      summary:
        "Tập trung vào thuật toán, tọa độ, cảm biến và giải quyết nhiệm vụ bay theo nhóm.",
      modules: ["Tọa độ", "Vòng lặp và điều kiện", "Cảm biến", "Nhiệm vụ đội hình"],
      outcomes: ["Viết kịch bản bay", "Tối ưu nhiệm vụ theo dữ liệu thử nghiệm"],
      status: "Đã hoàn thành",
      downloadLabel: "Xem mục lục",
    },
    {
      slug: "du-an-drone-cap-3",
      title: "Dự án drone ứng dụng cho cấp 3",
      level: "Cấp 3",
      format: "Project-based curriculum",
      summary:
        "Học sinh xây dựng dự án ứng dụng drone với dữ liệu, camera, AI cơ bản và báo cáo kỹ thuật.",
      modules: ["Thiết kế nhiệm vụ", "Dữ liệu bay", "Computer vision", "Báo cáo dự án"],
      outcomes: ["Hoàn thành prototype", "Trình bày quyết định kỹ thuật"],
      status: "Đã hoàn thành",
      downloadLabel: "Xem khung dự án",
    },
    {
      slug: "drone-ung-dung-dai-hoc",
      title: "Drone ứng dụng cho đại học",
      level: "Đại học",
      format: "Lab syllabus 10 buổi",
      summary:
        "Sinh viên thực hành lập trình bay, xử lý dữ liệu cảm biến, computer vision và thiết kế thí nghiệm.",
      modules: ["SDK drone", "Telemetry", "Computer vision", "Thiết kế lab report"],
      outcomes: ["Tạo pipeline thử nghiệm", "Phân tích dữ liệu bay có cấu trúc"],
      status: "Đã hoàn thành",
      downloadLabel: "Xem syllabus",
    },
    {
      slug: "phuong-phap-nghien-cuu-voi-drone",
      title: "Phương pháp nghiên cứu với drone",
      level: "Nghiên cứu",
      format: "Research protocol kit",
      summary:
        "Khung tài liệu cho nhóm nghiên cứu thiết kế giả thuyết, thu thập dữ liệu, kiểm soát rủi ro và tái lập thí nghiệm drone.",
      modules: ["Thiết kế protocol", "Data logging", "An toàn thử nghiệm", "Báo cáo kết quả"],
      outcomes: ["Chuẩn hóa quy trình thử nghiệm", "Tạo bộ dữ liệu có thể đối chiếu"],
      status: "Đã hoàn thành",
      downloadLabel: "Xem research kit",
    },
  ],
  services: [
    {
      slug: "tu-van-phong-lab",
      title: "Tư vấn phòng lab drone nghiên cứu & giáo dục",
      summary:
        "Thiết kế cấu hình thiết bị, không gian, lịch học, dữ liệu thử nghiệm và quy trình vận hành cho trường, trung tâm hoặc đại học.",
      deliverables: ["Bản cấu hình thiết bị", "Sơ đồ lớp học/lab", "Kế hoạch triển khai"],
      audience: ["Trường phổ thông", "Trung tâm STEM", "Đại học"],
      ctaLabel: "Trao đổi cấu hình lab",
    },
    {
      slug: "cung-cap-bo-drone",
      title: "Cung cấp bộ drone theo cấp học",
      summary:
        "Đề xuất bộ drone, phụ kiện, học liệu và nhiệm vụ mẫu theo độ tuổi, năng lực kỹ thuật và mục tiêu đào tạo.",
      deliverables: ["Danh mục thiết bị", "Học liệu đi kèm", "Checklist an toàn"],
      audience: ["Trường phổ thông", "Trung tâm STEM", "Đại học"],
      ctaLabel: "Xem bộ thiết bị",
    },
    {
      slug: "thiet-ke-nen-tang-nghien-cuu",
      title: "Thiết kế nền tảng drone nghiên cứu",
      summary:
        "Tùy biến drone, cảm biến, pipeline dữ liệu và protocol thử nghiệm cho đề tài nghiên cứu hoặc lab đại học.",
      deliverables: ["Thiết kế module", "Telemetry schema", "Research protocol"],
      audience: ["Đại học", "Lab nghiên cứu"],
      ctaLabel: "Trao đổi nền tảng R&D",
    },
    {
      slug: "giao-trinh-drone",
      title: "Biên soạn và chuyển giao giáo trình drone",
      summary:
        "Cung cấp giáo trình đã hoàn thành hoặc tùy biến theo chương trình STEM, robotics, AI hoặc nghiên cứu ứng dụng.",
      deliverables: ["Giáo án", "Slide bài giảng", "Rubric đánh giá"],
      audience: ["Trường phổ thông", "Trung tâm STEM", "Đại học"],
      ctaLabel: "Xem giáo trình",
    },
    {
      slug: "tap-huan-giang-vien",
      title: "Tập huấn giáo viên và giảng viên",
      summary:
        "Đào tạo đội ngũ vận hành drone, dạy thử, xử lý tình huống lớp học/lab và đánh giá dự án.",
      deliverables: ["Workshop", "Tài liệu giảng viên", "Kịch bản dạy thử"],
      audience: ["Giáo viên", "Giảng viên", "Nhà trường"],
      ctaLabel: "Lên lịch tập huấn",
    },
    {
      slug: "workshop-trai-nghiem",
      title: "Workshop và ngày hội trải nghiệm drone",
      summary:
        "Tổ chức hoạt động thực hành drone cho học sinh, sinh viên, phụ huynh hoặc sự kiện STEM của trường.",
      deliverables: ["Kịch bản sự kiện", "Thiết bị demo", "Huấn luyện viên"],
      audience: ["Học sinh", "Sinh viên", "Phụ huynh", "Trường học"],
      ctaLabel: "Tổ chức workshop",
    },
  ],
  partners: [
    {
      name: "Trường phổ thông",
      type: "Đơn vị triển khai",
      summary: "Tổ chức tiết học STEM, câu lạc bộ công nghệ và ngày hội trải nghiệm.",
    },
    {
      name: "Đại học và viện nghiên cứu",
      type: "Đối tác R&D",
      summary: "Phát triển đề tài drone, AI, computer vision, IoT và dữ liệu thực nghiệm.",
    },
    {
      name: "Trung tâm STEM",
      type: "Đối tác đào tạo",
      summary: "Mở lớp drone theo cấp độ với bộ giáo trình và thiết bị đồng bộ.",
    },
    {
      name: "Đơn vị công nghệ giáo dục",
      type: "Đối tác nội dung",
      summary: "Phối hợp chuẩn hóa học liệu, rubric, syllabus và chương trình tập huấn.",
    },
  ],
} satisfies SourceContent;

export const sourceContentEn = {
  site: {
    brand: {
      name: "Drone Viet",
      tagline: "Drone research and education lab",
      description:
        "Drone Viet provides drone solutions for research and education from grade school to university: hardware, curriculum, deployment materials, test platforms, and implementation support.",
    },
    navigation: [
      { label: "Solutions", href: "/en/solutions" },
      { label: "Products", href: "/en/products" },
      { label: "Curriculum", href: "/en/curriculum" },
      { label: "Services", href: "/en/services" },
      { label: "News", href: "/en/news" },
    ],
    hero: {
      eyebrow: "Drone lab for research & education",
      title: "Drones for research and education from grade school to university",
      description:
        "A drone ecosystem for students, universities, and research teams to learn flight programming, sensors, AI, experimental data, and aviation safety through hands-on projects.",
      primaryCta: {
        label: "Contact us now",
        href: "https://zalo.me/0384070636",
      },
      secondaryCta: {
        label: "View curriculum",
        href: "/en/curriculum",
      },
      metrics: [
        { label: "Drone kits", value: "05" },
        { label: "Levels", value: "Grade 1 - University" },
        { label: "Focus", value: "Edu + R&D" },
      ],
    },
    audiencePaths: [
      {
        name: "Schools",
        summary:
          "Deploy STEM lessons, drone clubs, hands-on labs, and experience days from grade school to high school.",
        href: "/en/services",
      },
      {
        name: "Universities and research labs",
        summary:
          "Build drone platforms for AI, computer vision, IoT, autonomous flight, and experimental data collection.",
        href: "/en/solutions",
      },
      {
        name: "STEM centers",
        summary:
          "Hardware kits, lesson plans, and instructor training programs for running drone classes by level.",
        href: "/en/curriculum",
      },
    ],
    process: [
      {
        title: "Define learning or research goals",
        summary:
          "Clarify learner age, technical level, flight space, data requirements, and expected outcomes.",
      },
      {
        title: "Design the solution package",
        summary:
          "Match drone hardware, curriculum, safety documents, sensor modules, and experimental tasks.",
      },
      {
        title: "Train and operate",
        summary:
          "Train teachers, instructors, or research teams to operate drones and run the first class or lab.",
      },
    ],
  },
  drones: [
    {
      slug: "dv-primary-lab",
      name: "DV Primary Lab",
      summary:
        "A safe mini drone kit for grade-school learners, designed for basic control, movement observation, and block-based programming.",
      level: "Grade 1",
      useCases: ["Intro STEM class", "Experience day", "Flight safety lesson"],
      learningOutcomes: [
        "Program basic flight using block commands",
        "Understand safety rules before takeoff",
        "Observe motion and sensor feedback",
      ],
      specs: [
        { label: "Session", value: "40-60 min" },
        { label: "Group", value: "2-4 learners/drone" },
        { label: "Space", value: "Indoor class" },
      ],
      image: "lab-grid-primary",
      featured: true,
    },
    {
      slug: "dv-code-fleet",
      name: "DV Code Fleet",
      summary:
        "A fleet-programming drone kit for middle school, built for algorithms, coordinates, missions, and teamwork.",
      level: "Grade 2",
      useCases: ["Formation programming", "Algorithm projects", "Internal competitions"],
      learningOutcomes: [
        "Design flight missions with coordinates",
        "Optimize navigation algorithms",
        "Collaborate on technical experiments",
      ],
      specs: [
        { label: "Language", value: "Block/Python" },
        { label: "Model", value: "Fleet 5-10 drones" },
        { label: "Theme", value: "Algorithm + robotics" },
      ],
      image: "lab-grid-code",
      featured: true,
    },
    {
      slug: "dv-ai-vision",
      name: "DV AI Vision",
      summary:
        "A computer-vision drone kit for high school projects, sensor data practice, and real-world mission simulation.",
      level: "Grade 3",
      useCases: ["Applied AI", "Student research", "Innovation contests"],
      learningOutcomes: [
        "Collect and analyze flight data",
        "Simulate object recognition missions",
        "Design constrained automation tasks",
      ],
      specs: [
        { label: "Module", value: "Camera + sensor" },
        { label: "Data", value: "Flight logs" },
        { label: "Focus", value: "AI/IoT project" },
      ],
      image: "lab-grid-vision",
      featured: true,
    },
    {
      slug: "dv-research-platform",
      name: "DV Research Platform",
      summary:
        "An open drone platform for universities and research labs testing flight algorithms, computer vision, IoT, and datasets.",
      level: "University",
      useCases: ["Research lab", "Computer vision", "Autonomous flight"],
      learningOutcomes: [
        "Design data-backed experiment protocols",
        "Integrate sensors and image-processing pipelines",
        "Evaluate navigation algorithms in controlled environments",
      ],
      specs: [
        { label: "SDK", value: "Python/API" },
        { label: "Module", value: "Camera + sensor bus" },
        { label: "Data", value: "Telemetry + dataset" },
      ],
      image: "lab-grid-research",
      featured: true,
    },
    {
      slug: "dv-instructor-kit",
      name: "DV Instructor Kit",
      summary:
        "A demo kit for teachers and university instructors with lesson plans, safety checklists, sample missions, and assessment materials.",
      level: "Instructor",
      useCases: ["Teacher training", "Demo lesson", "Curriculum standardization"],
      learningOutcomes: [
        "Run safe drone classes",
        "Assess student projects with rubrics",
        "Coordinate devices in classrooms or labs",
      ],
      specs: [
        { label: "Materials", value: "Lesson + lab pack" },
        { label: "Training", value: "1-2 days" },
        { label: "Support", value: "Remote/on-site" },
      ],
      image: "lab-grid-instructor",
      featured: false,
    },
  ],
  curriculum: [
    {
      slug: "drone-basics-grade-school",
      title: "Drone basics for grade school",
      level: "Grade 1",
      format: "8-session lesson plan",
      summary:
        "Learners start with safety, basic control, and simple block-programmed missions.",
      modules: ["Flight safety", "Basic control", "Block programming", "Maze challenge"],
      outcomes: ["Operate safely", "Complete a command-based flight mission"],
      status: "Completed",
      downloadLabel: "View lesson plan",
    },
    {
      slug: "drone-programming-middle-school",
      title: "Drone programming for middle school",
      level: "Grade 2",
      format: "12-session curriculum",
      summary:
        "A structured path through algorithms, coordinates, sensors, and group missions.",
      modules: ["Coordinates", "Loops and conditions", "Sensors", "Formation missions"],
      outcomes: ["Write flight scripts", "Optimize missions using test data"],
      status: "Completed",
      downloadLabel: "View outline",
    },
    {
      slug: "applied-drone-projects-high-school",
      title: "Applied drone projects for high school",
      level: "Grade 3",
      format: "Project-based curriculum",
      summary:
        "Students build drone projects using flight data, cameras, basic AI, and technical reports.",
      modules: ["Mission design", "Flight data", "Computer vision", "Project report"],
      outcomes: ["Complete a prototype", "Present technical decisions"],
      status: "Completed",
      downloadLabel: "View project frame",
    },
    {
      slug: "drone-lab-university",
      title: "Applied drone lab for university",
      level: "University",
      format: "10-session lab syllabus",
      summary:
        "Students practice SDK programming, telemetry, sensor data, computer vision, and experiment design.",
      modules: ["Drone SDK", "Telemetry", "Computer vision", "Lab report design"],
      outcomes: ["Build an experiment pipeline", "Analyze structured flight data"],
      status: "Completed",
      downloadLabel: "View syllabus",
    },
    {
      slug: "drone-research-methods",
      title: "Drone research methods",
      level: "Research",
      format: "Research protocol kit",
      summary:
        "A framework for research teams to design hypotheses, collect data, control risk, and reproduce experiments.",
      modules: ["Protocol design", "Data logging", "Experiment safety", "Results reporting"],
      outcomes: ["Standardize test procedures", "Create comparable datasets"],
      status: "Completed",
      downloadLabel: "View research kit",
    },
  ],
  services: [
    {
      slug: "lab-consulting",
      title: "Drone lab consulting",
      summary:
        "Design device configuration, learning space, lab data, and operating procedures for schools, centers, or universities.",
      deliverables: ["Hardware configuration", "Class/lab layout", "Deployment plan"],
      audience: ["Schools", "STEM centers", "Universities"],
      ctaLabel: "Discuss lab setup",
    },
    {
      slug: "drone-kit-supply",
      title: "Drone kits by level",
      summary:
        "Select drones, accessories, learning materials, and sample missions by age, skill, and training goals.",
      deliverables: ["Device list", "Learning materials", "Safety checklist"],
      audience: ["Schools", "STEM centers", "Universities"],
      ctaLabel: "View kits",
    },
    {
      slug: "research-platform-design",
      title: "Research drone platform design",
      summary:
        "Customize drones, sensors, data pipelines, and experiment protocols for research topics or university labs.",
      deliverables: ["Module design", "Telemetry schema", "Research protocol"],
      audience: ["Universities", "Research labs"],
      ctaLabel: "Discuss R&D platform",
    },
    {
      slug: "curriculum-transfer",
      title: "Drone curriculum transfer",
      summary:
        "Provide completed curriculum or customize programs for STEM, robotics, AI, or applied research.",
      deliverables: ["Lesson plans", "Slides", "Assessment rubrics"],
      audience: ["Schools", "STEM centers", "Universities"],
      ctaLabel: "View curriculum",
    },
    {
      slug: "instructor-training",
      title: "Teacher and instructor training",
      summary:
        "Train teams to operate drones, run classes/labs, handle edge cases, and evaluate projects.",
      deliverables: ["Workshop", "Instructor materials", "Demo lesson plan"],
      audience: ["Teachers", "Instructors", "Schools"],
      ctaLabel: "Schedule training",
    },
    {
      slug: "drone-workshops",
      title: "Drone workshops and experience days",
      summary:
        "Run hands-on drone activities for students, parents, or STEM events.",
      deliverables: ["Event script", "Demo devices", "Coaches"],
      audience: ["Students", "Parents", "Schools"],
      ctaLabel: "Plan workshop",
    },
  ],
  partners: [
    {
      name: "Schools",
      type: "Deployment units",
      summary: "STEM lessons, tech clubs, and experience days.",
    },
    {
      name: "Universities and research institutes",
      type: "R&D partners",
      summary: "Drone, AI, computer vision, IoT, and experimental data projects.",
    },
    {
      name: "STEM centers",
      type: "Training partners",
      summary: "Drone classes with aligned curriculum and hardware kits.",
    },
    {
      name: "EdTech organizations",
      type: "Content partners",
      summary: "Curriculum, rubrics, syllabi, and instructor training programs.",
    },
  ],
} satisfies SourceContent;

export const sourceContent = sourceContentVi;
