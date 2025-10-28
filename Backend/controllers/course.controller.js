 
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";
import path from "path";
import { Quiz } from "../models/quiz.model.js";
import { generateMcqQuizFromTranscript } from "../utils/generateMcqQuiz.js";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { spawn } from "child_process";
import { downloadVideo } from "../utils/video.js";
import { generateKeyPointsFromTranscript } from "../utils/generateKeyPoints.js";
import { generateGroqTranscript } from "../utils/groqTranscribe.js";



export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category) {
            return res.status(400).json({
                message:"Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        let { query = "", categories = [], sortByPrice = "" } = req.query;
        
        // Convert categories from string to array if needed
        if (typeof categories === 'string') {
            categories = categories.split(',').filter(cat => cat.trim() !== '');
        }
        
        console.log('Received categories:', categories);
        
        // Create a mapping for category variations
        const categoryMap = {
            'nextjs': 'Next JS',
            'data science': 'Data Science',
            'frontend development': 'Frontend Development',
            'fullstack development': 'Fullstack Development',
            'mern stack development': 'MERN Stack Development',
            'backend development': 'Backend Development',
            'javascript': 'Javascript',
            'python': 'Python',
            'docker': 'Docker',
            'mongodb': 'MongoDB',
            'html': 'HTML'
        };
        
        // Map the lowercase IDs to actual database category values
        const mappedCategories = categories.map(cat => categoryMap[cat.toLowerCase()] || cat);
        console.log('Mapped categories:', mappedCategories);
        
        // Create search query
        const searchCriteria = {
            isPublished: true,
        };

        // Build the search conditions
        const searchConditions = [];
        
        if (query) {
            searchConditions.push(
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            );
        }

        // If categories selected, add to criteria
        if (Array.isArray(mappedCategories) && mappedCategories.length > 0) {
            // Use case-insensitive regex matching
            searchCriteria.category = {
                $in: mappedCategories.map(cat => new RegExp(`^${cat}$`, 'i'))
            };
        }

        // Add $or condition only if we have search query
        if (searchConditions.length > 0) {
            searchCriteria.$or = searchConditions;
        }

        // Define sorting order
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1;
        }

        // console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

        let courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        // console.log('Found courses:', courses.length);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error searching courses"
        });
    }
};

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); // delete old image
      }
      // upload new thumbnail
      const uploaded = await uploadMedia(thumbnail.path);
      courseThumbnail = uploaded.secure_url;

      // remove local temp file
      fs.unlinkSync(thumbnail.path);
    }

    const updateData = {
      ...(courseTitle && { courseTitle }),
      ...(subTitle && { subTitle }),
      ...(description && { description }),
      ...(category && { category }),
      ...(courseLevel && { courseLevel }),
      ...(coursePrice && { coursePrice }),
      ...(courseThumbnail && { courseThumbnail }),
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json({
      course,
      message: "Course updated successfully."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update course" });
  }
};

export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    // Validation
    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title and courseId are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Video file is required",
      });
    }

    uploadedFilePath = req.file.path;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Upload video to Cloudinary
    const uploaded = await uploadMedia(uploadedFilePath);

    // Create lecture document
    const lecture = new Lecture({
      lectureTitle,
      videoUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      transcript: "",
      keyPoints: [],
    });

    // Generate transcript using Groq Whisper
    let transcriptionError = null;

    if (!process.env.GROQ_API_KEY) {
      transcriptionError = "GROQ_API_KEY not configured";
    } else if (!fs.existsSync(uploadedFilePath)) {
      transcriptionError = "File not found";
    } else {
      try {
        const transcript = await generateGroqTranscript(uploadedFilePath);
        if (transcript && transcript.trim().length > 0) {
          lecture.transcript = transcript.trim();
        } else {
          transcriptionError = "Empty transcript returned";
        }
      } catch (error) {
        transcriptionError = error.message;
      }
    }

    // Save lecture
    const savedLecture = await lecture.save();

    // Link lecture to course
    if (!course.lectures.includes(savedLecture._id)) {
      course.lectures.push(savedLecture._id);
      await course.save();
    }

    // Response
    return res.status(201).json({
      success: true,
      message: savedLecture.transcript
        ? "Lecture created with transcript successfully"
        : `Lecture created (transcription failed: ${transcriptionError})`,
      lecture: savedLecture,
      hasTranscript: !!savedLecture.transcript,
      transcriptLength: savedLecture.transcript?.length || 0,
      transcriptionError,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create lecture",
      error: error.message,
    });
  } finally {
    // Cleanup temp file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch {
        // ignore cleanup errors silently
      }
    }
  }
};

// test endpoint

export const testTranscription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Testing transcription for:", req.file.path);
    
    const transcript = await generateGroqTranscript(req.file.path);
    
    // Cleanup
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(200).json({
      success: true,
      hasTranscript: !!transcript,
      transcriptLength: transcript?.length || 0,
      preview: transcript?.substring(0, 200),
      fullTranscript: transcript
    });

  } catch (error) {
    console.error("Test failed:", error);
    
    // Cleanup
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}

export const editLecture = async (req, res) => {
  let tempPath = null;

  try {
    const { lectureTitle, isPreviewFree, videoInfo } = req.body;
    const { courseId, lectureId } = req.params;

    // Find lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return res.status(404).json({ message: "Lecture not found!" });

    // Update basic fields
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;

    let transcriptionError = null;

    // If video was updated
    if (videoInfo?.videoUrl) {
      if (lecture.publicId) {
        await deleteVideoFromCloudinary(lecture.publicId);
      }

      lecture.videoUrl = videoInfo.videoUrl;
      lecture.publicId = videoInfo.publicId;

      if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");
      tempPath = path.resolve(`./tmp/${lectureId}.mp4`);

      await downloadVideo(lecture.videoUrl, tempPath);

      if (!process.env.GROQ_API_KEY) {
        transcriptionError = "GROQ_API_KEY not configured";
      } else if (!fs.existsSync(tempPath)) {
        transcriptionError = "Downloaded file missing";
      } else {
        try {
          const transcript = await generateGroqTranscript(tempPath);
          if (transcript && transcript.trim().length > 0) {
            lecture.transcript = transcript.trim();
          } else {
            transcriptionError = "Empty transcript returned";
          }
        } catch (err) {
          transcriptionError = err.message;
        }
      }
    }

    const updatedLecture = await lecture.save();

    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: updatedLecture.transcript
        ? "Lecture updated and transcribed successfully."
        : transcriptionError
        ? `Lecture updated (transcription failed: ${transcriptionError})`
        : "Lecture updated successfully.",
      lecture: updatedLecture,
      hasTranscript: !!updatedLecture.transcript,
      transcriptLength: updatedLecture.transcript?.length || 0,
      transcriptionError,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to edit lecture",
      error: error.message,
    });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        // silently ignore cleanup errors
      }
    }
  }
};

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, 
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}

// publich unpublish course logic
export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}
// Delete a course
export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

  
    await Lecture.deleteMany({ _id: { $in: course.lectures } });

    //delete thumbnail from Cloudinary
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }

    return res.status(200).json({ message: "Course removed successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to remove course" });
  }
};

// Create quiz for a lecture based on its transcript
export const createLectureQuiz = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    //Find lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Generate quiz from transcript
    if (!lecture.transcript) {
      return res.status(400).json({ message: "Lecture transcript is empty" });
    }

    const generatedQuestions = await generateMcqQuizFromTranscript(lecture.transcript);

    // Map LLM output to your schema
    const questions = generatedQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.answer, 
      explanation: q.explanation, 
    }));
    // console.log("Mapped questions ready for DB:", questions);


    const quiz = await Quiz.create({
      lecture: lectureId,
      questions,
    });

    return res.status(201).json({
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get quiz by lectureId
export const getLectureQuiz = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const quiz = await Quiz.findOne({ lecture: lectureId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found for this lecture" });
    }

    res.status(200).json({ quiz });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

// Generate key points for a lecture
export const getLectureKeyPoints = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.transcript || lecture.transcript.trim().length < 20) {
      return res.status(400).json({ message: "Transcript is too short to generate key points." });
    }

    // Generate key points from transcript
    const keyPoints = await generateKeyPointsFromTranscript(lecture.transcript);
    // console.log("Generated key points:", keyPoints);
  
    lecture.keyPoints = keyPoints;
    await lecture.save();

    return res.status(200).json({ lectureId, keyPoints });
  } catch (error) {
    console.error("Failed to get key points:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};