import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, writeBatch, getDocs, where,
} from "firebase/firestore";
import { db } from "./firebase";

const CATEGORIES = [
  { id: "fruta",     label: "Fruta y Verdura",  emoji: "🥦" },
  { id: "carne",     label: "Carne y Pescado",   emoji: "🥩" },
  { id: "lacteos",   label: "Lácteos y Huevos",  emoji: "🥛" },
  { id: "panaderia", label: "Panadería",          emoji: "🍞" },
  { id: "despensa",  label: "Despensa",           emoji: "🫙" },
  { id: "limpieza",  label: "Limpieza e Higiene", emoji: "🧴" },
  { id: "bebidas",   label: "Bebidas",            emoji: "🧃" },
  { id: "otros",     label: "Otros",              emoji: "🛒" },
];

const COLLECTION = "items";

export default function ListaCompras() {
  const [items, setItems]             = useState([]);
  const [newItem, setNewItem]         = useState("");
  const [newCategory, setNewCategory] = useState("otros");
  const [newQty, setNewQty]           = useState("");
  const [filter, setFilter]           = useState("all");
  const [loading, setLoading]         = useState(true);
  const [connected, setConnected]     = useState(false);
  const inputRef = useRef(null);

  // Escucha en tiempo real
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("addedAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setConnected(true);
      },
      () => { setConnected(false); setLoading(false); }
    );
    return () => unsub();
  }, []);

  async function addItem() {
    const name = newItem.trim();
    if (!name) return;
    await addDoc(collection(db, COLLECTION), {
      name,
      category: newCategory,
      qty: newQty.trim() || "",
      done: false,
      addedAt: Date.now(),
    });
    setNewItem("");
    setNewQty("");
    inputRef.current?.focus();
  }

  async function toggleItem(item) {
    await updateDoc(doc(db, COLLECTION, item.id), { done: !item.done });
  }

  async function removeItem(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async function clearDone() {
    const snap = await getDocs(query(collection(db, COLLECTION), where("done", "==", true)));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const filtered =
    filter === "all"     ? items :
    filter === "pending" ? items.filter((i) => !i.done) :
                           items.filter((i) => i.category === filter);

  const grouped = CATEGORIES
    .map((cat) => ({ ...cat, items: filtered.filter((i) => i.category === cat.id) }))
    .filter((g) => g.items.length > 0);

  const totalPending = items.filter((i) => !i.done).length;
  const totalDone    = items.filter((i) => i.done).length;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Georgia', serif", color: "#2C2416" }}>
      <style>{`
        @keyframes strikethrough { from { width: 0 } to { width: 100% } }
        .item-done .item-name::after {
          content: ''; position: absolute; left: 0; top: 50%;
          height: 2px; background: #B05A2A; width: 100%;
          animation: strikethrough 0.3s ease forwards; border-radius: 1px;
        }
        .item-name { position: relative; display: inline-block; }
        .item-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; transition: background 0.15s; cursor: pointer;
        }
        .item-row:hover { background: #F0EBE1; }
        .item-done .item-name { opacity: 0.45; }
        .cat-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px; font-size: 12px;
          font-family: system-ui; border: 1px solid #D9CEB8;
          background: white; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .cat-chip.active { background: #2C2416; color: #FAF7F2; border-color: #2C2416; }
        .add-btn {
          background: #2C2416; color: #FAF7F2; border: none; border-radius: 8px;
          padding: 10px 20px; font-size: 15px; cursor: pointer;
          font-family: system-ui; font-weight: 600; transition: opacity 0.15s;
        }
        .add-btn:hover { opacity: 0.85; }
        .clear-btn {
          background: transparent; border: 1px solid #D9CEB8; border-radius: 8px;
          padding: 6px 14px; font-size: 13px; color: #7A6A54;
          cursor: pointer; font-family: system-ui; transition: all 0.15s;
        }
        .clear-btn:hover { background: #F0EBE1; }
        input, select {
          font-family: system-ui; font-size: 15px; border: 1.5px solid #D9CEB8;
          border-radius: 8px; padding: 10px 12px; background: white;
          color: #2C2416; outline: none; transition: border-color 0.15s;
        }
        input:focus, select:focus { border-color: #B05A2A; }
        .checkbox {
          width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D9CEB8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .checkbox.checked { background: #B05A2A; border-color: #B05A2A; }
        .delete-btn {
          opacity: 0; background: none; border: none; color: #B05A2A;
          cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px;
          transition: opacity 0.15s; margin-left: auto; flex-shrink: 0;
        }
        .item-row:hover .delete-btn { opacity: 1; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#2C2416", color: "#FAF7F2", padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: "-0.5px" }}>🛒 La Lista</div>
          <div style={{ fontSize: 12, opacity: 0.6, fontFamily: "system-ui", marginTop: 2 }}>
            Lista compartida · {totalPending} por comprar{totalDone > 0 ? `, ${totalDone} listos` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontFamily: "system-ui", opacity: 0.7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", display: "inline-block",
            marginRight: 5, background: connected ? "#6BB86B" : "#E05A2A"
          }} />
          {connected ? "Conectado · tiempo real" : "Sin conexión"}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px" }}>

        {/* Formulario */}
        <div style={{
          background: "white", border: "1.5px solid #D9CEB8", borderRadius: 12,
          padding: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10,
        }}>
          <input
            ref={inputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Añadir producto…"
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Cantidad (ej: 2kg)"
              style={{ flex: "1 1 100px", minWidth: 80 }}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ flex: "2 1 160px" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <button className="add-btn" onClick={addItem} style={{ alignSelf: "flex-end" }}>
            + Añadir
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          <button className={`cat-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todo</button>
          <button className={`cat-chip ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>⏳ Pendientes</button>
          {CATEGORIES.map((c) => {
            const count = items.filter((i) => i.category === c.id).length;
            if (!count) return null;
            return (
              <button key={c.id} className={`cat-chip ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>
                {c.emoji} {c.label.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#7A6A54", fontFamily: "system-ui" }}>
            Conectando con Firebase…
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#7A6A54", fontFamily: "system-ui" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontWeight: 600 }}>La lista está vacía</div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>Añade el primer producto arriba</div>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#7A6A54", fontFamily: "system-ui" }}>
            Sin resultados para este filtro
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {grouped.map((group) => (
              <div key={group.id}>
                <div style={{
                  fontSize: 13, fontFamily: "system-ui", fontWeight: 700, color: "#7A6A54",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {group.emoji} {group.label}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>({group.items.length})</span>
                </div>
                <div style={{ background: "white", border: "1.5px solid #E8E0D2", borderRadius: 10, overflow: "hidden" }}>
                  {group.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`item-row ${item.done ? "item-done" : ""}`}
                      style={{ borderTop: idx > 0 ? "1px solid #F0EBE1" : "none" }}
                    >
                      <div className={`checkbox ${item.done ? "checked" : ""}`} onClick={() => toggleItem(item)}>
                        {item.done && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }} onClick={() => toggleItem(item)}>
                        <span className="item-name" style={{ fontSize: 15, fontFamily: "system-ui", fontWeight: item.done ? 400 : 500 }}>
                          {item.name}
                        </span>
                        {item.qty && (
                          <span style={{ marginLeft: 8, fontSize: 12, color: "#B05A2A", fontFamily: "system-ui", opacity: item.done ? 0.5 : 1 }}>
                            {item.qty}
                          </span>
                        )}
                      </div>
                      <button className="delete-btn" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalDone > 0 && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button className="clear-btn" onClick={clearDone}>
              🗑 Borrar {totalDone} {totalDone === 1 ? "producto comprado" : "productos comprados"}
            </button>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "#C0B49A", fontFamily: "system-ui" }}>
          Sincronización en tiempo real · Firebase Firestore
        </div>
      </div>
    </div>
  );
}
