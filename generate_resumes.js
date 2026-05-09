const fs = require('fs');
const PDFDocument = require('pdfkit');

const resumes = [
  {
    name: 'Alice Smith',
    content: `ALICE SMITH
Email: alice@example.com | Phone: 555-0101

EDUCATION
B.S. Computer Science, State University (Graduated May 2026)
GPA: 3.8/4.0

SKILLS
Languages: Java, Python, JavaScript, TypeScript
Frameworks: React, Node.js, Express
Tools: Git, Docker, MongoDB

EXPERIENCE
Software Engineering Intern - TechCorp (Summer 2025)
- Developed a REST API using Node.js and Express, reducing data retrieval time by 20%.
- Contributed to frontend migration using React and Redux, writing over 50 components.

PROJECTS
Task Manager App: A full-stack web app built with React, Node.js, and MongoDB. Implemented user authentication and real-time syncing.
`
  },
  {
    name: 'Bob Jones',
    content: `BOB JONES
Email: bob.jones@email.com

EDUCATION
B.A. English, Liberal Arts College (2025)

SKILLS
Soft Skills: Communications, Writing, Problem Solving
Tech Skills: Microsoft Word, Excel, PowerPoint, Basic HTML.

EXPERIENCE
Barista - Local Coffee Shop (2024-Present)
- Managed inventory, trained 3 new employees, and handled customer service during peak volume hours.

PROJECTS
Personal Blog: Wrote weekly articles using WordPress and basic HTML/CSS.
`
  },
  {
    name: 'Charlie Brown',
    content: `CHARLIE BROWN
charlie.b@example.com

EDUCATION
B.S. Software Engineering, Tech Institute (Expected 2026)
GPA: 3.9/4.0

SKILLS
Top Skills: JavaScript, TypeScript, React, Next.js
Other Skills: Tailwind CSS, PostgreSQL, Supabase, Python.

EXPERIENCE
Freelance Full-Stack Developer (2023-Present)
- Built 5 responsive e-commerce websites for local businesses using Next.js and Firebase.
- Optimized page load speeds by 40% using server-side rendering and static site generation.
- Designed scalable database schemas in PostgreSQL.
`
  },
  {
    name: 'Diana Prince',
    content: `DIANA PRINCE
diana@example.com

EDUCATION
Bootcamp Certificate in Data Science, DataCamp (2025)
B.S. Physics, Science University (2024)

SKILLS
Python, Pandas, NumPy, SQL, Machine Learning, TensorFlow, Tableau.

EXPERIENCE
Data Analyst Intern - DataWiz (2025)
- Created interactive dashboards using Tableau for executive reporting.
- Cleaned and transformed datasets containing over 100,000 rows using Pandas and Python scripts.
`
  },
  {
    name: 'Evan Wright',
    content: `EVAN WRIGHT
evan@example.com

EDUCATION
M.S. Computer Science, Elite University (2026)
B.S. Mathematics, State University (2024)

SKILLS
Languages: C++, Java, Python, Golang
Concepts: Distributed Systems, Algorithms, Data Structures, Operating Systems.

EXPERIENCE
Teaching Assistant - Data Structures & Algorithms (2025)
- Led weekly recitations for 40 students and graded C++ assignments.
- Explaining complex runtime complexities and dynamic programming concepts.

PROJECTS
Custom Search Engine: Implemented a PageRank algorithm in C++ distributed across 3 nodes handling 10,000 documents.
`
  }
];

if (!fs.existsSync('./test-resumes')) {
  fs.mkdirSync('./test-resumes');
}

resumes.forEach((r, i) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(\`./test-resumes/\${r.name.replace(/ /g, '_')}_Resume.pdf\`));
  doc.fontSize(12).text(r.content);
  doc.end();
});
console.log('Successfully created 5 PDF resumes in ./test-resumes/');
