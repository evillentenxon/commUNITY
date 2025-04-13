const express = require('express');
const router = express.Router();
const { createUser, userInfo, pictureChange } = require('../controllers/userController');
const upload = require('../config/multerConfig')
const { sentOtp, otpVerify, loginUser, logout } = require('../controllers/authController')
const { createCommunity, joinCommunity, getCommunitiesByCreater, getCommunitiesByMember, exploreCommunity, top10Communities, leaveCommunity, searchCommunity, filterCommunity, delCommunity, editCommunity, isUserMember } = require('../controllers/communityController');
const authenticateUser = require('../middleware/myMiddleware');
const notice = require('../controllers/noticeController');

//AUTH ROUTES
router.post('/otp_sent', sentOtp);  //send otp
router.post('/otp_verify', otpVerify); //verify otp

//USERS ROUTES
router.post('/register', upload.single('profilePic'), createUser); //signup
router.post('/login', loginUser); //login
router.patch('/changeProfile', upload.single('profilePic'), authenticateUser, pictureChange); //profile change
router.get('/logout/', logout); //logout user

//COMMUNITIES ROUTES
router.post('/create_community', upload.single('image'), authenticateUser, createCommunity); //create community
router.get('/my_communities', authenticateUser, getCommunitiesByCreater); //fetch communities by creater
router.get('/joined_communities', authenticateUser, getCommunitiesByMember); //fetch communities by member
router.get('/explore/:communityId', exploreCommunity); //explore community
router.patch('/join_community/:communityId', authenticateUser, joinCommunity); //join community
router.get('/top10', authenticateUser, top10Communities); //display top 10 communities
router.delete('/leave_community', authenticateUser, leaveCommunity); //leave community
router.get('/search_community/', searchCommunity); //search community
router.post('/filter_Community', filterCommunity); //filter community
router.delete('/del_community', delCommunity); //delete community
router.delete('/del_mem', leaveCommunity); //delete member of community
router.patch('/edit_community/:communityId', upload.single('image'), editCommunity); //edit community
router.get('/isMember/:communityId/:userId', isUserMember); //is user member

//ACCOUNT PAGE ROUTES
router.get('/profile', authenticateUser, userInfo) //user profile

//NOTICE PAGE ROUTES
router.post('/create_notice', authenticateUser, notice.createNotice); //create notice
router.get('/get_notice/:communityId', notice.getNoticesByCommunity); //fetch notice by community
router.delete('/del_notice', authenticateUser, notice.deleteNotice); //delete notice

module.exports = router;
