// Frontend-only demonstration. Data is stored in this browser; no backend/blockchain is connected.
const STORAGE_KEY = "traceback_frontend_demo_v1";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function sampleData() {
  const now = new Date().toISOString();
  const items = [
    { id: "LF-1001", name: "Blue water bottle", category: "Accessories", location: "Library, 2nd floor", dateFound: "2026-10-20", description: "Blue reusable bottle with a silver cap.", finder: "Student volunteer", status: "Found", createdAt: now, claim: null },
    { id: "LF-1002", name: "Notebook", category: "Books & Stationery", location: "CSE block, Room 204", dateFound: "2026-10-21", description: "Black notebook with a plain cover.", finder: "Campus desk", status: "Claimed", createdAt: now, claim: { claimant: "Demo Student", proof: "There are handwritten notes from my class inside.", status: "Pending", createdAt: now } },
    { id: "LF-1003", name: "Key ring", category: "Keys", location: "Cafeteria entrance", dateFound: "2026-10-18", description: "Two keys on a small metal ring.", finder: "Student volunteer", status: "Returned", createdAt: now, claim: null }
  ];
  const events = [
    { id: "EV-1001", itemId: "LF-1001", action: "Item registered", details: "Blue water bottle registered as found.", time: now },
    { id: "EV-1002", itemId: "LF-1002", action: "Claim submitted", details: "A claim was submitted for Notebook.", time: now },
    { id: "EV-1003", itemId: "LF-1003", action: "Item returned", details: "Key ring marked as returned.", time: now }
  ];
  return { items, events, nextItem: 1004, nextEvent: 1004 };
}
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : sampleData();
  } catch (error) {
    return sampleData();
  }
}
let db = loadData();
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
function addEvent(itemId, action, details) {
  db.events.unshift({ id: `EV-${db.nextEvent++}`, itemId, action, details, time: new Date().toISOString() });
}
function showNotice(message, isError = false) {
  const notice = $("#notice");
  notice.textContent = message;
  notice.classList.toggle("error", isError);
  notice.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => notice.classList.add("hidden"), 4500);
}
function setView(name) {
  $$(".view").forEach(view => view.classList.toggle("hidden", view.id !== `view-${name}`));
  $$(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === name));
  if (name === "dashboard") renderDashboard();
  if (name === "search") renderItems();
  if (name === "claims") renderClaims();
  if (name === "history") renderHistory();
  $("#notice").classList.add("hidden");
}
function statusClass(status) { return `status-${status.toLowerCase()}`; }
function itemCard(item) {
  const claimButton = item.status === "Found"
    ? `<button class="secondary-btn" data-claim="${escapeHTML(item.id)}">Claim item</button>` : "";
  const markReturned = item.status === "Claimed" && item.claim?.status === "Approved"
    ? `<button class="primary-btn" data-return="${escapeHTML(item.id)}">Mark returned</button>` : "";
  return `<article class="item-card">
    <div class="item-top"><div><div class="item-category">${escapeHTML(item.category)}</div><h3>${escapeHTML(item.name)}</h3></div><span class="status ${statusClass(item.status)}">${escapeHTML(item.status)}</span></div>
    <p class="item-description">${escapeHTML(item.description)}</p>
    <div class="item-meta"><span><strong>Location:</strong> ${escapeHTML(item.location)}</span><span><strong>Date found:</strong> ${escapeHTML(item.dateFound)}</span><span class="item-id">${escapeHTML(item.id)}</span></div>
    <div class="card-actions">${claimButton}${markReturned}</div>
  </article>`;
}
function renderDashboard() {
  $("#stat-total").textContent = db.items.length;
  $("#stat-found").textContent = db.items.filter(i => i.status === "Found").length;
  $("#stat-claims").textContent = db.items.filter(i => i.claim?.status === "Pending").length;
  $("#stat-returned").textContent = db.items.filter(i => i.status === "Returned").length;
  const recent = [...db.items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,3);
  $("#recent-items").innerHTML = recent.length ? recent.map(itemCard).join("") : '<p class="empty-state">No items registered yet. Report a found item to get started.</p>';
}
function renderItems() {
  const query = $("#search-input").value.trim().toLowerCase();
  const status = $("#status-filter").value;
  const results = [...db.items].filter(item => {
    const searchable = [item.id, item.name, item.category, item.location, item.description].join(" ").toLowerCase();
    return searchable.includes(query) && (status === "All" || item.status === status);
  }).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  $("#all-items").innerHTML = results.map(itemCard).join("");
  $("#empty-search").classList.toggle("hidden", results.length > 0);
  $("#result-count").textContent = `${results.length} item${results.length === 1 ? "" : "s"} found`;
}
function renderClaims() {
  const claims = db.items.filter(item => item.claim);
  $("#claims-list").innerHTML = claims.map(item => {
    const claim = item.claim;
    const actions = claim.status === "Pending" ? `<div class="claim-actions"><button class="primary-btn" data-approve="${escapeHTML(item.id)}">Approve claim</button><button class="danger-btn" data-reject="${escapeHTML(item.id)}">Reject claim</button></div>` : `<span class="status ${claim.status === "Approved" ? "status-returned" : "status-found"}">${escapeHTML(claim.status)}</span>`;
    return `<article class="claim-card"><div><h3>${escapeHTML(item.name)} <span class="item-id">(${escapeHTML(item.id)})</span></h3><p><strong>Claimant:</strong> ${escapeHTML(claim.claimant)}</p><p><strong>Reason:</strong> ${escapeHTML(claim.proof)}</p><p><strong>Submitted:</strong> ${new Date(claim.createdAt).toLocaleString()}</p></div>${actions}</article>`;
  }).join("");
  $("#empty-claims").classList.toggle("hidden", claims.length > 0);
}
function renderHistory() {
  $("#history-list").innerHTML = db.events.length ? db.events.map(event => `<div class="timeline-entry"><div class="timeline-dot"></div><div><strong>${escapeHTML(event.action)} <span class="item-id">· ${escapeHTML(event.itemId)}</span></strong><p>${escapeHTML(event.details)}</p><time>${new Date(event.time).toLocaleString()}</time></div></div>`).join("") : '<p class="empty-state">No events recorded yet.</p>';
}
function openClaim(itemId) {
  const item = db.items.find(i => i.id === itemId);
  if (!item) return;
  $("#claim-form").elements.itemId.value = itemId;
  $("#claim-dialog").showModal();
}
$("#register-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  const item = {
    id: `LF-${db.nextItem++}`, name: values.name.trim(), category: values.category,
    location: values.location.trim(), dateFound: values.dateFound,
    description: values.description.trim(), finder: values.finder.trim(),
    status: "Found", createdAt: new Date().toISOString(), claim: null
  };
  db.items.unshift(item);
  addEvent(item.id, "Item registered", `${item.name} registered at ${item.location}.`);
  saveData(); form.reset(); renderDashboard(); setView("dashboard");
  showNotice(`Item registered successfully. Your item ID is ${item.id}.`);
});
$("#claim-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  const item = db.items.find(i => i.id === values.itemId);
  if (!item || item.status !== "Found") { $("#claim-dialog").close(); showNotice("This item is no longer available for a new claim.", true); return; }
  item.claim = { claimant: values.claimant.trim(), proof: values.proof.trim(), status: "Pending", createdAt: new Date().toISOString() };
  item.status = "Claimed";
  addEvent(item.id, "Claim submitted", `A claim was submitted for ${item.name}.`);
  saveData(); form.reset(); $("#claim-dialog").close(); renderItems(); renderDashboard();
  showNotice("Claim submitted. A reviewer can now check it.");
});
$("#close-claim").addEventListener("click", () => $("#claim-dialog").close());
$("#search-input").addEventListener("input", renderItems);
$("#status-filter").addEventListener("change", renderItems);
$("#clear-search").addEventListener("click", () => { $("#search-input").value = ""; $("#status-filter").value = "All"; renderItems(); });
$("#export-history").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(db.events, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "traceback-event-history.json"; link.click();
  URL.revokeObjectURL(url);
});
$("#reset-demo").addEventListener("click", () => {
  if (!confirm("Reset all local demo data to the sample records? This cannot be undone.")) return;
  db = sampleData(); saveData(); renderHistory(); renderDashboard(); showNotice("Demo data has been reset.");
});
document.addEventListener("click", event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.view || target.dataset.go) { setView(target.dataset.view || target.dataset.go); return; }
  if (target.dataset.claim) { openClaim(target.dataset.claim); return; }
  if (target.dataset.approve) {
    const item = db.items.find(i => i.id === target.dataset.approve);
    if (item?.claim) { item.claim.status = "Approved"; addEvent(item.id, "Claim approved", `Claim for ${item.name} approved in demo.`); saveData(); renderClaims(); renderItems(); renderDashboard(); showNotice("Claim approved. Mark the item returned after the handover."); }
  }
  if (target.dataset.reject) {
    const item = db.items.find(i => i.id === target.dataset.reject);
    if (item?.claim) { item.claim.status = "Rejected"; item.status = "Found"; addEvent(item.id, "Claim rejected", `Claim for ${item.name} rejected in demo.`); item.claim = null; saveData(); renderClaims(); renderItems(); renderDashboard(); showNotice("Claim rejected. The item is available to be claimed again."); }
  }
  if (target.dataset.return) {
    const item = db.items.find(i => i.id === target.dataset.return);
    if (item) { item.status = "Returned"; addEvent(item.id, "Item returned", `${item.name} marked as returned after handover.`); saveData(); renderItems(); renderDashboard(); showNotice("Item marked as returned."); }
  }
});
saveData();
renderDashboard();
