import streamlit as st
import pandas as pd
from datetime import datetime

# --- CONFIGURATION & THEME ---
st.set_page_config(page_title="H2O Pro Tracker", layout="centered")

# Custom CSS for Sporty Dark Mode
st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 20px; background-color: #007bff; color: white; font-weight: bold; border: none; }
    .stButton>button:hover { background-color: #00d4ff; color: #0e1117; }
    .metric-card { background-color: #1c212b; padding: 20px; border-radius: 15px; border: 1px solid #00d4ff; text-align: center; }
    </style>
    """, unsafe_allow_html=True)

# --- APP LOGIC ---
st.title("💧 H2O PRO | Team Hydration")

# 1. Simple User Selection
users = ["Coach Alex", "Coach Jordan", "Coach Sam", "Coach Taylor"]
selected_user = st.selectbox("Who is tracking?", users)

# 2. Setup / Weight Info (Stored in Session for this demo)
# In a production version, these would be pulled from your "forever" database
weight_kg = st.number_input("Enter your weight (kg) to calculate goal", min_value=40, max_value=200, value=80)
daily_goal_oz = round((weight_kg / 20) * 33.814)

st.markdown(f"### Your Daily Goal: **{daily_goal_oz} oz**")

# --- TRACKING SECTION ---
st.divider()
col1, col2, col3 = st.columns(3)

# Logic to handle water addition
if 'count' not in st.session_state:
    st.session_state.count = 0

with col1:
    if st.button("+8 oz"):
        st.session_state.count += 8
with col2:
    if st.button("+16 oz"):
        st.session_state.count += 16
with col3:
    if st.button("+32 oz"):
        st.session_state.count += 32

custom_add = st.number_input("Custom Amount (oz)", min_value=0, step=1)
if st.button("Add Custom"):
    st.session_state.count += custom_add

# --- VISUAL PROGRESS ---
progress = min(st.session_state.count / daily_goal_oz, 1.0)
st.progress(progress)
st.subheader(f"Current Intake: {st.session_state.count} / {daily_goal_oz} oz")

# --- LEADERBOARD (Gamification) ---
st.divider()
st.subheader("🏆 Hydration League")
# Mock data for leaderboard
leaderboard_data = {
    "User": ["Coach Alex", "Coach Jordan", "Coach Sam", "Coach Taylor"],
    "Goal Met %": ["85%", "40%", "92%", f"{int(progress*100)}%"]
}
df = pd.DataFrame(leaderboard_data)
st.table(df.sort_values(by="Goal Met %", ascending=False))

# --- REMINDERS ---
if progress < 0.5 and datetime.now().hour > 12:
    st.warning("⚠️ You're behind on your hydration goal for this afternoon!")
