/* ---- Find Your Level: measured item difficulties ----
 Item id -> difficulty (logits, same scale as LVB in level.js), written by tools/calibrate.mjs from
 anonymous answers learners chose to share. An item listed here uses its measured difficulty instead of
 the estimate from its level label. Empty until enough answers are collected (see worker/README.md).
 LVCAL switches the "share my answers" box on the result page on; turn it on only after the Worker
 has its CAL storage (worker/README.md, "Calibrating the placement test"). */
var LVCAL=false,LVBCAL={};
