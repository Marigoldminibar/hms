const SESSION_TIMEOUT_MINUTES = 15;

let currentPin = "";
let hasPhoto = false;
let currentPhotoData = "";

let globalRoomsPool = [];
let approvedRecords = [];

let currentAction = "";
let targetRoom = "";
let targetRecordId = "";

let depotParties = [];
let roomSktDatabase = {};
let roomMemory = {};
let quantities = {};

let isAdminLoggedIn = false;
let isStaffLoggedIn = false;
let isReceptionLoggedIn = false;

let adminLoginAttempts = 0;
let adminLockedUntil = 0;
