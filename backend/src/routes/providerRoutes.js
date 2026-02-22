const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Provider routes working ✅");
});

module.exports = router;