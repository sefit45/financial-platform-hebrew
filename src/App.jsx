// App.jsx
// החלף את פונקציית inputStyle + הוסף onboardingLabelStyle
// והשתמש בהן בכל מסכי ה-Onboarding

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "12px 14px",
    fontSize: 14,
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    fontWeight: 500,
    outline: "none",
  };
}

function onboardingLabelStyle() {
  return {
    display: "block",
    marginBottom: 8,
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.4,
  };
}

function helperTextStyle() {
  return {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 1.5,
  };
}

/*
בכל מקום שבו יש לך:

<label style={{ display: "block", marginBottom: 8 }}>

החלף ל:

<label style={onboardingLabelStyle()}>

--------------------------------------------

דוגמה מלאה לשדה תקין:

<div>
  <label style={onboardingLabelStyle()}>
    שכר דירה / משכנתא
  </label>

  <input
    type="number"
    placeholder="הזן סכום"
    style={inputStyle()}
    value={formData.rent}
    onChange={(e) =>
      setFormData({
        ...formData,
        rent: e.target.value,
      })
    }
  />
</div>

--------------------------------------------

דוגמה לטקסט הסבר:

<p style={helperTextStyle()}>
  הזנת ההוצאות הקבועות תאפשר למערכת
  ליצור עבורך תחזית חודשית אוטומטית.
</p>

--------------------------------------------

דוגמה מלאה למסך "הוצאות קבועות"

*/

<div
  style={{
    background: "rgba(15,23,42,0.82)",
    borderRadius: 28,
    padding: 32,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    }}
  >
    <div>
      <div style={{ color: "#cbd5e1", fontSize: 14 }}>
        שלב 4 מתוך 7
      </div>

      <h2
        style={{
          color: "#ffffff",
          margin: "8px 0 0 0",
          fontSize: 42,
          fontWeight: 800,
        }}
      >
        הוצאות קבועות
      </h2>
    </div>
  </div>

  <div
    style={{
      width: "100%",
      height: 8,
      borderRadius: 999,
      background: "rgba(255,255,255,0.12)",
      marginBottom: 32,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: "57%",
        height: "100%",
        background: "#22c55e",
        borderRadius: 999,
      }}
    />
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
    }}
  >
    <div>
      <label style={onboardingLabelStyle()}>
        שכר דירה / משכנתא
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={onboardingLabelStyle()}>
        ארנונה
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={onboardingLabelStyle()}>
        מים
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={onboardingLabelStyle()}>
        חשמל
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={onboardingLabelStyle()}>
        אינטרנט + סלולר
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={onboardingLabelStyle()}>
        ביטוחים
      </label>
      <input
        type="number"
        placeholder="הזן סכום"
        style={inputStyle()}
      />
    </div>
  </div>

  <div style={{ marginTop: 28 }}>
    <p style={helperTextStyle()}>
      הזנת ההוצאות הקבועות תאפשר למערכת
      ליצור עבורך תחזית חודשית אוטומטית
      ולהציג תמונת מצב פיננסית מדויקת.
    </p>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: 32,
    }}
  >
    <button
      style={{
        background: "#ffffff",
        color: "#0f172a",
        border: "none",
        borderRadius: 14,
        padding: "14px 28px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      הקודם
    </button>

    <button
      style={{
        background: "#22c55e",
        color: "#ffffff",
        border: "none",
        borderRadius: 14,
        padding: "14px 28px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      המשך
    </button>
  </div>
</div>
