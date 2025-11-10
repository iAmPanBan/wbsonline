// Centralized course data (replace with brochure content)
window.COURSES = [
  {
    id: "intro-data-science",
    title: "Intro to Data Science",
    level: "beginner",
    lessonsCount: 24,
    description: "Learn Python, NumPy, and basic ML to analyze datasets.",
    cover: "./assets/img/placeholder.svg",
    enrolled: true,
    progress: 45,
    syllabus: [
      { title: "Getting Started", duration: "06:12", video: "" },
      { title: "Python Refresher", duration: "12:30", video: "" },
      { title: "Working with NumPy", duration: "14:48", video: "" },
      { title: "Pandas Basics", duration: "16:05", video: "" }
    ]
  },
  {
    id: "fullstack-web-dev",
    title: "Full‑Stack Web Development",
    level: "intermediate",
    lessonsCount: 36,
    description: "Build robust apps with HTML, CSS, JS, APIs and DBs.",
    cover: "./assets/img/placeholder.svg",
    enrolled: true,
    progress: 72,
    syllabus: [
      { title: "Web Foundations", duration: "10:10", video: "" }
    ]
  },
  {
    id: "product-management-foundations",
    title: "Product Management Foundations",
    level: "beginner",
    lessonsCount: 18,
    description: "Learn discovery, roadmapping, and metrics that matter.",
    cover: "./assets/img/placeholder.svg",
    enrolled: true,
    progress: 15,
    syllabus: [
      { title: "Discovery", duration: "08:15", video: "" }
    ]
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    level: "advanced",
    lessonsCount: 48,
    description: "Model training, MLOps, and deployment best practices.",
    cover: "./assets/img/placeholder.svg",
    enrolled: false,
    progress: 0,
    syllabus: [
      { title: "MLOps Overview", duration: "11:22", video: "" }
    ]
  },
  {
    id: "cloud-fundamentals",
    title: "Cloud Fundamentals",
    level: "beginner",
    lessonsCount: 20,
    description: "Compute, storage, networking and security across providers.",
    cover: "./assets/img/placeholder.svg",
    enrolled: false,
    progress: 0,
    syllabus: [
      { title: "Cloud 101", duration: "09:40", video: "" }
    ]
  },
  {
    id: "sql-essentials",
    title: "SQL Essentials",
    level: "intermediate",
    lessonsCount: 14,
    description: "From SELECT basics to joins, windows, and CTEs.",
    cover: "./assets/img/placeholder.svg",
    enrolled: false,
    progress: 0,
    syllabus: [
      { title: "Intro to SQL", duration: "07:35", video: "" }
    ]
  },
  // Beginner (additions)
  { id: "python-basics", title: "Python Basics", level: "beginner", lessonsCount: 22, description: "Syntax, data types, control flow, and functions.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Variables & Types", duration: "06:05" }] },
  { id: "javascript-essentials", title: "JavaScript Essentials", level: "beginner", lessonsCount: 26, description: "Core JS, DOM, and modern syntax.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Intro to JS", duration: "07:10" }] },
  { id: "html-css-mastery", title: "HTML & CSS Mastery", level: "beginner", lessonsCount: 28, description: "Semantic HTML, modern CSS, and responsive design.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Flexbox & Grid", duration: "08:45" }] },
  { id: "react-fundamentals", title: "React Fundamentals", level: "beginner", lessonsCount: 24, description: "Components, props, state, and hooks basics.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "JSX & Components", duration: "09:12" }] },
  { id: "nodejs-basics", title: "Node.js Basics", level: "beginner", lessonsCount: 20, description: "Modules, npm, scripts, and simple servers.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Node Runtime", duration: "05:58" }] },
  { id: "data-viz-python", title: "Data Visualization with Python", level: "beginner", lessonsCount: 18, description: "Matplotlib, Seaborn, and plot styling.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Plotting Basics", duration: "06:52" }] },
  { id: "statistics-for-ds", title: "Statistics for Data Science", level: "beginner", lessonsCount: 21, description: "Descriptive stats, probability, and inference basics.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Distributions", duration: "07:33" }] },
  { id: "excel-for-analysts", title: "Excel for Analysts", level: "beginner", lessonsCount: 16, description: "Functions, pivot tables, and charts for analysis.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Formulas 101", duration: "05:30" }] },
  { id: "powerbi-fundamentals", title: "Power BI Fundamentals", level: "beginner", lessonsCount: 17, description: "Data import, modeling, and interactive reports.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Data Model", duration: "06:41" }] },
  { id: "linux-command-line", title: "Linux Command Line", level: "beginner", lessonsCount: 19, description: "Filesystem, permissions, and shell scripting basics.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Bash Basics", duration: "06:20" }] },
  { id: "git-github", title: "Git and GitHub", level: "beginner", lessonsCount: 18, description: "Commits, branches, merges, and pull requests.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Branching", duration: "05:47" }] },
  { id: "agile-basics", title: "Agile Basics", level: "beginner", lessonsCount: 14, description: "Scrum, roles, ceremonies, and artifacts.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Scrum 101", duration: "04:55" }] },
  { id: "jira-for-teams", title: "Jira for Teams", level: "beginner", lessonsCount: 12, description: "Boards, issues, workflows, and dashboards.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Boards", duration: "04:22" }] },
  { id: "ux-fundamentals", title: "UX Fundamentals", level: "beginner", lessonsCount: 16, description: "Research, wireframes, and usability principles.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "User Research", duration: "06:31" }] },
  { id: "intro-cybersecurity", title: "Intro to Cybersecurity", level: "beginner", lessonsCount: 15, description: "Threats, vulnerabilities, and basic controls.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "CIA Triad", duration: "05:18" }] },

  // Intermediate (additions)
  { id: "react-advanced-patterns", title: "React Advanced Patterns", level: "intermediate", lessonsCount: 22, description: "Context, reducers, composition, and performance.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Hooks Deep Dive", duration: "08:05" }] },
  { id: "vuejs-fundamentals", title: "Vue.js Fundamentals", level: "intermediate", lessonsCount: 20, description: "Reactivity, components, and Vue Router.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Reactivity", duration: "07:12" }] },
  { id: "django-web-apps", title: "Django Web Apps", level: "intermediate", lessonsCount: 28, description: "ORM, templates, auth, and admin site.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Models", duration: "09:01" }] },
  { id: "flask-apis", title: "Flask APIs", level: "intermediate", lessonsCount: 18, description: "Blueprints, JWT auth, and testing APIs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "REST Basics", duration: "06:49" }] },
  { id: "rest-api-design", title: "REST API Design", level: "intermediate", lessonsCount: 16, description: "Resources, pagination, versioning, and errors.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "HTTP Semantics", duration: "06:00" }] },
  { id: "typescript-for-js-devs", title: "TypeScript for JS Devs", level: "intermediate", lessonsCount: 19, description: "Types, generics, and tooling for large apps.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Generics", duration: "07:27" }] },
  { id: "nextjs-essentials", title: "Next.js Essentials", level: "intermediate", lessonsCount: 20, description: "Routing, data fetching, and deployment.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "App Router", duration: "07:45" }] },
  { id: "database-design", title: "Database Design", level: "intermediate", lessonsCount: 21, description: "Normalization, ER models, and indexing.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Keys & Indexes", duration: "06:58" }] },
  { id: "nosql-mongodb", title: "NoSQL with MongoDB", level: "intermediate", lessonsCount: 18, description: "Documents, aggregation, and schema design patterns.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Aggregation", duration: "06:43" }] },
  { id: "docker-for-devs", title: "Docker for Devs", level: "intermediate", lessonsCount: 16, description: "Images, containers, and multi-stage builds.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Dockerfiles", duration: "06:22" }] },
  { id: "kubernetes-fundamentals", title: "Kubernetes Fundamentals", level: "intermediate", lessonsCount: 22, description: "Pods, deployments, services, and configs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Deployments", duration: "08:12" }] },
  { id: "cicd-github-actions", title: "CI/CD with GitHub Actions", level: "intermediate", lessonsCount: 17, description: "Workflows, jobs, caching, and deployments.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Workflows", duration: "06:18" }] },
  { id: "testing-javascript", title: "Testing JavaScript", level: "intermediate", lessonsCount: 18, description: "Unit, integration, E2E, and mocking patterns.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Jest Basics", duration: "06:57" }] },
  { id: "go-for-web-devs", title: "Go for Web Devs", level: "intermediate", lessonsCount: 20, description: "Goroutines, channels, and HTTP servers.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Concurrency", duration: "07:31" }] },
  { id: "java-spring-boot", title: "Java Spring Boot", level: "intermediate", lessonsCount: 24, description: "REST services, JPA, and Spring Security.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Controllers", duration: "07:22" }] },

  // Advanced (additions)
  { id: "tensorflow-deep-learning", title: "Deep Learning with TensorFlow", level: "advanced", lessonsCount: 26, description: "Neural nets, CNNs, and training pipelines.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Keras Models", duration: "08:10" }] },
  { id: "nlp-transformers", title: "NLP with Transformers", level: "advanced", lessonsCount: 22, description: "Tokenizers, attention, and fine-tuning models.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Attention", duration: "08:00" }] },
  { id: "computer-vision", title: "Computer Vision", level: "advanced", lessonsCount: 21, description: "CNNs, detection, and augmentation pipelines.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Convolutions", duration: "07:48" }] },
  { id: "advanced-sql-optimization", title: "Advanced SQL & Optimization", level: "advanced", lessonsCount: 20, description: "Execution plans, indexing, and query tuning.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Explain Plans", duration: "07:02" }] },
  { id: "distributed-systems", title: "Distributed Systems", level: "advanced", lessonsCount: 24, description: "Consensus, replication, and fault tolerance patterns.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "CAP & PACELC", duration: "08:34" }] },
  { id: "system-design", title: "System Design", level: "advanced", lessonsCount: 23, description: "Scalability, caching, and load balancing trade-offs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Design Process", duration: "07:55" }] },
  { id: "microservices-architecture", title: "Microservices Architecture", level: "advanced", lessonsCount: 22, description: "Bounded contexts, comms, and observability at scale.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Service Boundaries", duration: "07:37" }] },
  { id: "event-driven-architectures", title: "Event-Driven Architectures", level: "advanced", lessonsCount: 20, description: "Events, pub/sub, and idempotency patterns.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Event Models", duration: "06:58" }] },
  { id: "kafka-streaming", title: "Streaming with Kafka", level: "advanced", lessonsCount: 19, description: "Producers, consumers, and stream processing APIs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Topics & Partitions", duration: "06:40" }] },
  { id: "advanced-kubernetes", title: "Advanced Kubernetes", level: "advanced", lessonsCount: 21, description: "StatefulSets, operators, and scaling workloads.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Operators", duration: "08:21" }] },
  { id: "terraform-iac", title: "Terraform IaC", level: "advanced", lessonsCount: 18, description: "Modules, workspaces, and multi-cloud patterns.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Modules", duration: "06:29" }] },
  { id: "cloud-security", title: "Security for Cloud", level: "advanced", lessonsCount: 20, description: "Identity, encryption, and secure architectures.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "IAM", duration: "07:11" }] },
  { id: "pentest-foundations", title: "Penetration Testing Basics", level: "advanced", lessonsCount: 17, description: "Recon, exploitation, and reporting methodology.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Recon", duration: "06:12" }] },
  { id: "advanced-algorithms", title: "Advanced Algorithms", level: "advanced", lessonsCount: 22, description: "Graphs, DP, and complexity analysis deep dive.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Graph Traversals", duration: "07:59" }] },
  { id: "big-data-spark", title: "Big Data with Spark", level: "advanced", lessonsCount: 21, description: "RDDs, DataFrames, and structured streaming.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "RDDs", duration: "07:25" }] },

  // More beginner to reach 15
  { id: "sql-for-beginners", title: "SQL for Beginners", level: "beginner", lessonsCount: 15, description: "Query basics and relational thinking.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "SELECT", duration: "05:40" }] },
  { id: "git-advanced-workflows", title: "Git Advanced Workflows", level: "intermediate", lessonsCount: 16, description: "Rebase, cherry-pick, and bisect in practice.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Rebase", duration: "06:14" }] },
  { id: "figma-for-beginners", title: "Figma for Beginners", level: "beginner", lessonsCount: 12, description: "Frames, components, and prototyping basics.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Components", duration: "05:05" }] },
  { id: "command-line-tools", title: "Command Line Tools", level: "beginner", lessonsCount: 14, description: "grep, sed, awk, and pipelines.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "grep", duration: "05:33" }] },

  // Extra intermediate to reach 15
  { id: "nodejs-apis", title: "Node.js APIs", level: "intermediate", lessonsCount: 20, description: "Express, validation, and testing APIs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Express Router", duration: "06:45" }] },
  { id: "python-data-engineering", title: "Python Data Engineering", level: "intermediate", lessonsCount: 22, description: "ETL, orchestration, and data quality checks.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Pipelines", duration: "07:02" }] },
  { id: "react-native-basics", title: "React Native Basics", level: "intermediate", lessonsCount: 18, description: "Components, navigation, and platform APIs.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Navigation", duration: "06:36" }] },

  // Extra advanced to reach 15
  { id: "mlops-production", title: "MLOps in Production", level: "advanced", lessonsCount: 23, description: "Experiment tracking, model registry, and CI/CD ML.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "Tracking", duration: "07:46" }] },
  { id: "graph-ml", title: "Graph Machine Learning", level: "advanced", lessonsCount: 19, description: "GNNs, embeddings, and graph pipelines.", cover: "./assets/img/placeholder.svg", enrolled: false, progress: 0, syllabus: [{ title: "GNN Basics", duration: "07:12" }] }
];
