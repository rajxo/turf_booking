const express = require('express');
const router = express.Router();
const {
    createTurf,
    updateTurf,
    deleteTurf,
    getOwnerTurfs,
    getAllActiveTurfs,
    getTurfById,
    getAllCities,
    getSportsTypes,
    uploadCoverImage,
    uploadGalleryImages,
    deleteGalleryImage,
} = require('../controllers/turfController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { uploadCoverImage: uploadCoverMiddleware, uploadGalleryImages: uploadGalleryMiddleware, handleMulterError } = require('../middleware/imageUpload');

/**
 * @route   GET /api/turfs/cities
 * @desc    Get all available cities (for dropdown)
 * @access  Public
 */
router.get('/cities', getAllCities);

/**
 * @route   GET /api/turfs/sports-types
 * @desc    Get all available sports types (for dropdown)
 * @access  Public
 */
router.get('/sports-types', getSportsTypes);

/**
 * @route   GET /api/turfs
 * @desc    Get all active turfs (public)
 * @access  Public
 */
router.get('/', getAllActiveTurfs);

/**
 * @route   GET /api/turfs/my-turfs
 * @desc    Get all turfs owned by the current owner
 * @access  Private (Owner only)
 */
router.get('/my-turfs', auth, authorize('owner'), getOwnerTurfs);

/**
 * @route   GET /api/turfs/:id
 * @desc    Get single turf by ID (public)
 * @access  Public
 */
router.get('/:id', getTurfById);

/**
 * @route   POST /api/turfs
 * @desc    Create a new turf
 * @access  Private (Owner only)
 */
router.post('/', auth, authorize('owner'), createTurf);

/**
 * @route   POST /api/turfs/:id/cover-image
 * @desc    Upload turf cover image
 * @access  Private (Owner only - own turf)
 */
router.post('/:id/cover-image', auth, authorize('owner'), uploadCoverMiddleware, handleMulterError, uploadCoverImage);

/**
 * @route   POST /api/turfs/:id/images
 * @desc    Upload turf gallery images
 * @access  Private (Owner only - own turf)
 */
router.post('/:id/images', auth, authorize('owner'), uploadGalleryMiddleware, handleMulterError, uploadGalleryImages);

/**
 * @route   PUT /api/turfs/:id
 * @desc    Update a turf
 * @access  Private (Owner only - own turf)
 */
router.put('/:id', auth, authorize('owner'), updateTurf);

/**
 * @route   DELETE /api/turfs/:id
 * @desc    Soft delete a turf (isActive = false)
 * @access  Private (Owner only - own turf)
 */
router.delete('/:id', auth, authorize('owner'), deleteTurf);

/**
 * @route   DELETE /api/turfs/:id/images/:imageIndex
 * @desc    Delete a gallery image
 * @access  Private (Owner only - own turf)
 */
router.delete('/:id/images/:imageIndex', auth, authorize('owner'), deleteGalleryImage);

module.exports = router;
