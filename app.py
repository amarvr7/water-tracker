import streamlit as st
from streamlit_gsheets import GSheetsConnection
import pandas as pd
from datetime import datetime

# --- CONFIG & THEME ---
st.set_page_config(page_title="H2O Pro Tracker", layout="centered")

st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 20px; background-color: #007bff; color: white; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# --- GOOGLE SHEETS CONNECTION ---
# This connects to the URL you will provide in the Streamlit Dashboard later
# --- GOOGLE SHEETS CONNECTION ---
# Replace your existing conn and df section with this:
sheet_url = st.secrets["connections"]["gsheets"]["spreadsheet"]

# This part converts a standard Google Sheet URL into a direct CSV export link
# which is much less likely to throw an HTTPError
csv_url = sheet_url.replace('/edit#gid=', '/export?format=csv&gid=')
if '/edit?' in csv_url:
    csv_url = csv_url.replace('/edit?', '/export?format=csv&')
elif '/edit' in csv_url and '/export' not in csv_url:
    csv_url = csv_url.replace('/edit', '/export?format=csv')

try:
    df = pd.read_csv(csv_url)
except Exception as e:
    st.error("Connection Error. Please ensure your Google Sheet is set to 'Anyone with the link can EDIT'")
    st.stop()

# --- APP LOGIC ---
st.title("💧 H2O PRO | Team Hydration")

users = ["Coach Alex", "Coach Jordan", "Coach Sam", "Coach Taylor"]
selected_user = st.selectbox("Who is tracking?", users)

weight_kg = st.number_input("Weight (kg)", min_value=40, value=80)
daily_goal_oz = round((weight_kg / 20) * 33.814)

# --- FETCH CURRENT DATA ---
# Read the 'logs' tab from the Google Sheet
df = conn.read(worksheet="logs")
today = datetime.now().strftime('%Y-%m-%d')

# Calculate user's total for today
if not df.empty:
    user_today_df = df[(df['User'] == selected_user) & (df['Date'] == today)]
    current_total = user_today_df['Intake'].sum()
else:
    current_total = 0

# --- ADD WATER ---
st.markdown(f"### Goal: {daily_goal_oz} oz | Current: {current_total} oz")
col1, col2, col3 = st.columns(3)

def add_water(amount):
    new_data = pd.DataFrame([{
        "Date": today,
        "User": selected_user,
        "Intake": amount,
        "Goal": daily_goal_oz
    }])
    # Append the new row to the Google Sheet
    updated_df = pd.concat([df, new_data], ignore_index=True)
    conn.update(worksheet="logs", data=updated_df)
    st.success(f"Added {amount}oz!")
    st.rerun()

with col1:
    if st.button("+8 oz"): add_water(8)
with col2:
    if st.button("+16 oz"): add_water(16)
with col3:
    if st.button("+32 oz"): add_water(32)

# --- PROGRESS & LEADERBOARD ---
progress = min(current_total / daily_goal_oz, 1.0)
st.progress(progress)

st.divider()
st.subheader("🏆 Hydration League")
if not df.empty:
    # Logic to show % of goal met by user for today
    leaderboard = df[df['Date'] == today].groupby('User').agg({'Intake': 'sum', 'Goal': 'max'})
    leaderboard['% Done'] = (leaderboard['Intake'] / leaderboard['Goal'] * 100).astype(int).astype(str) + "%"
    st.table(leaderboard[['% Done']].sort_values(by='% Done', ascending=False))
