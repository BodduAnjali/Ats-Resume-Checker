const TECHNICAL_KEYWORDS = {
    "javascript": 2,
    "react": 2,
    "redux": 2,
    "html": 1,
    "css": 1,
    "git": 1,
    "agile": 1,
    "typescript": 2,
    "aws": 2,
    "docker": 2,
    "node": 2,
    "python": 2,
    "api": 2,
    "rest": 1,
    "sql": 2,
    "mongo": 2,
    "jira": 1,
    "java": 2,
    "linux": 2,
    "kubernetes": 2,
    "graphql": 2
};

function extractTechnicalKeywords(text) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const uniqueWords = new Set(words);
    return [...uniqueWords].filter(word => word in TECHNICAL_KEYWORDS);
}

function calculateTechnicalScore(resumeText, jobDescText, resultDisplay) {
    const resumeWords = extractTechnicalKeywords(resumeText);
    const jobKeywords = extractTechnicalKeywords(jobDescText);

    let totalWeight = 0;
    let matchedWeight = 0;
    const matchedWords = [];

    jobKeywords.forEach(word => {
        const weight = TECHNICAL_KEYWORDS[word];
        totalWeight += weight;
        if (resumeWords.includes(word)) {
            matchedWeight += weight;
            matchedWords.push(word);
        }
    });

    const score = totalWeight === 0 ? 0 : Math.floor((matchedWeight / totalWeight) * 100);

    resultDisplay.innerText =
        `✅ ATS Score: ${score}%\n` +
        `✅ Matched Technical Keywords: ${matchedWords.join(', ') || 'None'}`;
}

function checkResume() {
    const fileInput = document.getElementById("resumeUpload");
    const jobDescInput = document.getElementById("jobDescription").value;
    const resultDisplay = document.getElementById("result");

    if (fileInput.files.length !== 1) {
        resultDisplay.innerText = "Please upload exactly one resume file (.txt or .pdf).";
        return;
    }

    if (!jobDescInput.trim()) {
        resultDisplay.innerText = "Please paste a job description.";
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = () => {
            calculateTechnicalScore(reader.result, jobDescInput, resultDisplay);
        };
        reader.readAsText(file);
    } else if (fileName.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.onload = async () => {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

            let textContent = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                const pageText = text.items.map(item => item.str).join(" ");
                textContent += pageText + " ";
            }

            calculateTechnicalScore(textContent, jobDescInput, resultDisplay);
        };
        reader.readAsArrayBuffer(file);
    } else {
        resultDisplay.innerText = "Unsupported file type. Only .txt or .pdf files are allowed.";
    }
}
