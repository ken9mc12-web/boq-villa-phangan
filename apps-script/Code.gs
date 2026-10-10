/**
 * BOQ บ้าน คสล. 2 ชั้น + สระว่ายน้ำ เกาะพะงัน — เว็บแก้ไข/บันทึกเบิก (Google Apps Script)
 * ข้อมูลเก็บใน Google Sheet นี้ (แท็บ "db") · ภาพการ์ดคำนวณดึงจาก GitHub Pages
 *
 * ติดตั้ง: วาง Code.gs + Index.html → เลือกฟังก์ชัน setup → Run (ครั้งเดียว)
 *         → Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone)
 */
const SITE = 'https://ken9mc12-web.github.io/boq-villa-phangan/';   // ที่อยู่เว็บ GitHub Pages (ภาพ + ข้อมูลตั้งต้น)
const SHEET = 'db';

function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  t.SITE = SITE;
  return t.evaluate()
    .setTitle('BOQ บ้านสระว่ายน้ำ เกาะพะงัน')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.getRange(1, 1, 1, 4).setValues([['collection', 'id', 'json', 'updatedAt']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** โหลดข้อมูลตั้งต้นจาก data.json บน GitHub Pages (รันครั้งเดียว — ถ้ามีข้อมูลแล้วจะไม่ทับ) */
function setup() {
  const sh = sheet_();
  if (sh.getLastRow() > 1) { Logger.log('มีข้อมูลอยู่แล้ว ไม่ได้นำเข้าซ้ำ (ถ้าจะเริ่มใหม่ ให้ลบแถวในแท็บ db ก่อน)'); return; }
  const data = JSON.parse(UrlFetchApp.fetch(SITE + 'data.json').getContentText('UTF-8'));
  const now = new Date();
  const rows = [];
  Object.keys(data).forEach(c => Object.keys(data[c]).forEach(id => rows.push([c, id, JSON.stringify(data[c][id]), now])));
  sh.getRange(2, 1, rows.length, 4).setValues(rows);
  PropertiesService.getScriptProperties().setProperty('EDIT_PIN', PropertiesService.getScriptProperties().getProperty('EDIT_PIN') || '1234');
  Logger.log('นำเข้า ' + rows.length + ' แถว · รหัสแก้ไข (PIN) เริ่มต้น = 1234 — เปลี่ยนได้ด้วยฟังก์ชัน setPin');
}

/** เปลี่ยนรหัสแก้ไข: แก้ตัวเลขด้านล่าง แล้ว Run ฟังก์ชันนี้ (ใส่ '' = ไม่ต้องใช้รหัส) */
function setPin() {
  PropertiesService.getScriptProperties().setProperty('EDIT_PIN', '1234');
}

function getAll() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  const out = {};
  if (n > 0) sh.getRange(2, 1, n, 3).getValues().forEach(r => {
    if (!r[0]) return;
    (out[r[0]] = out[r[0]] || {})[r[1]] = JSON.parse(r[2] || '{}');
  });
  return JSON.stringify(out);
}

function checkPin(pin) {
  const p = PropertiesService.getScriptProperties().getProperty('EDIT_PIN') || '';
  return !p || String(pin || '') === p;
}

/** op: set | update | add | delete */
function write(op, coll, id, json, pin) {
  if (!checkPin(pin)) throw new Error('PIN');
  if (!/^[A-Za-z0-9_\-]+$/.test(coll)) throw new Error('bad collection');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_();
    const n = sh.getLastRow() - 1;
    const keys = n > 0 ? sh.getRange(2, 1, n, 2).getValues() : [];
    if (op === 'add') id = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    let row = -1;
    for (let i = 0; i < keys.length; i++) if (keys[i][0] === coll && String(keys[i][1]) === String(id)) { row = i + 2; break; }
    const data = json ? JSON.parse(json) : {};
    if (op === 'delete') { if (row > 0) sh.deleteRow(row); return id; }
    let doc = data;
    if (op === 'update' && row > 0) doc = Object.assign(JSON.parse(sh.getRange(row, 3).getValue() || '{}'), data);
    const vals = [[coll, id, JSON.stringify(doc), new Date()]];
    if (row > 0) sh.getRange(row, 1, 1, 4).setValues(vals); else sh.appendRow(vals[0]);
    return id;
  } finally { lock.releaseLock(); }
}
