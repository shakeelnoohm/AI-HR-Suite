const fs = require('fs');

if (!fs.existsSync('./test-resumes')) {
  fs.mkdirSync('./test-resumes');
}

const jd = `**Job Title**: Junior Software Development Engineer (Fresher)
**Location**: Remote
**About the Role**:
We are looking for a motivated graduating senior or recent graduate to join our frontend/full-stack team as a Junior SDE. You will work alongside senior engineers to build user-facing features, optimize APIs, and improve web performance.

**Requirements**:
- Bachelor's degree in Computer Science, Software Engineering, or related field
- Strong proficiency in JavaScript/TypeScript
- Experience with modern frontend frameworks (React, Next.js)
- Familiarity with backend development (Node.js/Express) and REST APIs
- Problem-Solving mentality.
`;

fs.writeFileSync('./test-resumes/Job_Description.txt', jd);

const r1 = `ALICE SMITH
alice@example.com
EDUCATION: B.S. Computer Science (2026), GPA 3.8
SKILLS: Java, Python, JavaScript, TypeScript, React, Node.js, Git
EXPERIENCE: Software Engineering Intern - TechCorp (Summer 2025). Developed REST API using Node.js, Frontend with React.`;

const r2 = `BOB JONES
bob.jones@email.com
EDUCATION: B.A. English (2025)
SKILLS: Microsoft Word, Excel, Writing, HTML
EXPERIENCE: Barista - Local Coffee Shop. Managed inventory and customer service.`;

const r3 = `CHARLIE BROWN
charlie@example.com
EDUCATION: B.S. Software Engineering (2026)
SKILLS: JavaScript, TypeScript, React, Next.js, Web Performance, PostgreSQL
EXPERIENCE: Freelance Full-Stack Developer. Built 5 Next.js e-commerce sites. Optimized load speeds by 40%.`;

const r4 = `DIANA PRINCE
diana@example.com
EDUCATION: Bootcamp Data Science (2025)
SKILLS: Python, Pandas, Machine Learning, SQL
EXPERIENCE: Data Analyst Intern. Created dashboards in Tableau.`;

const r5 = `EVAN WRIGHT
evan@example.com
EDUCATION: M.S. Computer Science (2026)
SKILLS: C++, Java, Golang, Algorithms
EXPERIENCE: Teaching Assistant for Data Structures & Algorithms. Explaining C++ pointers and memory.`;

fs.writeFileSync('./test-resumes/Alice_Resume.txt', r1);
fs.writeFileSync('./test-resumes/Bob_Resume.txt', r2);
fs.writeFileSync('./test-resumes/Charlie_Resume.txt', r3);
fs.writeFileSync('./test-resumes/Diana_Resume.txt', r4);
fs.writeFileSync('./test-resumes/Evan_Resume.txt', r5);
console.log('Successfully generated test data files in ./test-resumes');
