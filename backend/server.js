const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4001;

// Initialize GoogleGenerativeAI with the API key
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Load the gemini model asynchronously
let geminiModel;
(async () => {
    geminiModel = await googleAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });
})();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(express.json());

app.use(cors({ origin:"https://ai-power-resume-ux.vercel.app"}));

// Helper function to generate unique IDs
const generateID = () => Math.random().toString(36).substring(2, 10);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});

// Async function to generate content using Google Generative AI
const generateTextWithGoogleAI = async (question) => {
    try {
        const result = await geminiModel.generateContent(question);
        return result.response?.text || "No content generated.";
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};

// Route to handle resume creation
app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
    try {
        const { fullName, currentPosition, currentLength, currentTechnologies, workHistory } = req.body;
        const workArray = JSON.parse(workHistory);
        
        const educationList = Array.isArray(education) ? education : JSON.parse(education);
        const certificationList = Array.isArray(certifications) ? certifications : JSON.parse(certifications);

        const newEntry = {
            id: generateID(),
            fullName,
            image_url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
            currentPosition,
            currentLength,
            currentTechnologies,
            workHistory: workArray,
            education: educationList,
            certifications: certificationList,
        };

        // Define prompts
        const prompt1 = `I am writing a resume. My details are: name: ${fullName}, role: ${currentPosition} (${currentLength} years), technologies: ${currentTechnologies}. Write a 100-word profile summary.`;
        const prompt2 = `Describe my strengths for a resume in 10 bullet points based on: ${currentPosition}, ${currentLength} years of experience, and technologies like ${currentTechnologies}.`;
        const workSummary = workArray.map(item => `${item.name} as a ${item.position}`).join(', ');
        const prompt3 = `Summarize my job successes at companies where I worked as: ${workSummary}. Write 50 words for each.`;
     

        // Generate content using AI
        const objective = await generateTextWithGoogleAI(prompt1);
        const keypoints = await generateTextWithGoogleAI(prompt2);
        const jobResponsibilities = await generateTextWithGoogleAI(prompt3);
   

        // Combine generated content with input data
        const generatedResumeData = { objective, keypoints, jobResponsibilities };
        const data = { ...newEntry, ...generatedResumeData };

        res.json({
            message: "Resume generated successfully!",
            data,
        });
    } catch (error) {
        console.error("Error in /resume/create:", error.message);
        res.status(500).json({ message: "An error occurred while generating the resume.", error });
    }
});

app.get("/", (req, res) => {
    res.send("Developer");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
