import Carousel from "../models/Carousel.js";

// 🛠 ADMIN: GET ALL CAROUSELS
export const getAllCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find().sort({ createdAt: -1 });
    res.json({ success: true, carousels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🛠 ADMIN: GET CAROUSEL BY PAGE
export const getCarouselByPage = async (req, res) => {
  try {
    const { page } = req.params;
   
    
    const carousel = await Carousel.findOne({ page });
    
    if (!carousel) {
      return res.json({ success: true, carousel: null });
    }
    
    
    res.json({ success: true, carousel: carousel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🛠 ADMIN: ADD SINGLE SLIDE
export const addSlide = async (req, res) => {
  try {
    const { page, title, subtitle, description, showButton,
      buttonText, buttonLink, buttonColor } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image required" });
    }

    const slide = {
      image: `/uploads/products/${req.file.filename}`,
      title: title || "",
      subtitle: subtitle || "",
      description: description || "",
      showButton: showButton === "true",
      buttonText: buttonText || "",
      buttonLink: buttonLink || "",
      buttonColor: buttonColor || "bg-purple-600 hover:bg-purple-700",
    };

    // Find carousel by page
    let carousel = await Carousel.findOne({ page });

    if (!carousel) {
      // Create new carousel if doesn't exist
      carousel = new Carousel({
        page,
        slides: [slide]
      });
    } else {
      // Add slide to existing carousel
      carousel.slides.push(slide);
    }

    await carousel.save();
    res.json({ success: true, carousel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🛠 ADMIN: UPDATE SLIDE
export const updateSlide = async (req, res) => {
  try {
    const { page, slideId } = req.params;
    const updateData = { ...req.body };

    // Handle showButton conversion
    if (updateData.showButton !== undefined) {
      updateData.showButton = updateData.showButton === "true";
    }

    // Find carousel
    const carousel = await Carousel.findOne({ page });
    if (!carousel) {
      return res.status(404).json({ success: false, message: "Carousel not found" });
    }

    // Find slide index
    const slideIndex = carousel.slides.findIndex(slide => slide._id.toString() === slideId);
    if (slideIndex === -1) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    // Update slide
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    carousel.slides[slideIndex] = {
      ...carousel.slides[slideIndex].toObject(),
      ...updateData,
      _id: carousel.slides[slideIndex]._id
    };

    await carousel.save();
    res.json({ success: true, carousel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🛠 ADMIN: DELETE SLIDE
export const deleteSlide = async (req, res) => {
  try {
    const { page, slideId } = req.params;

    const carousel = await Carousel.findOne({ page });
    if (!carousel) {
      return res.status(404).json({ success: false, message: "Carousel not found" });
    }

    // Remove slide
    carousel.slides = carousel.slides.filter(slide => slide._id.toString() !== slideId);
    await carousel.save();

    res.json({ success: true, message: "Slide deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};