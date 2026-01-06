import streamlit as st
import pandas as pd
from datetime import datetime

# --- CONFIG & THEME ---
st.set_page_config(page_title="H2O Pro Tracker", layout="centered")

# Sporty Dark Mode Styling
st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 20px; background-color: #007bff; color: white; font-weight: 200; height: 3em; border: none; }
    .stButton>button:hover { background-color: #00d4ff; color: #0e1117; }
    [data-testid="stMetricValue"] { color: #00d4ff !important; }
    </style>
    """, unsafe_allow_html=True)

# --- DATA LOADING ---
# This uses the 'Publish to Web' CSV link for maximum reliability
SHEET_CSV_URL = st.secrets["connections"]["gsheets"]["spreadsheet"]

def load_data():
    try:
        # Adding a timestamp prevents the browser from showing "old" data
        url = f"{SHEET_CSV_URL}&t={datetime.now().timestamp()}"
        df = pd.read_csv(url)
        # Clean up any empty rows or dummy data automatically
        df = df.dropna(subset=['User'])
        return df
    except:
        # If the sheet is totally empty, return a clean structure
        return pd.DataFrame(columns=["Date", "User", "Intake", "Goal"])

def save_data(user, amount, goal):
    try:
        from streamlit_gsheets import GSheetsConnection
        conn = st.connection("gsheets", type=GSheetsConnection)
        
        # Pull fresh data to append to
        current_df = load_data()
        
        new_row = pd.DataFrame([{
            "Date": datetime.now().strftime('%Y-%m-%d'),
            "User": user,
            "Intake": amount,
            "Goal": goal
        }])
        
        updated_df = pd.concat([current_df, new_row], ignore_index=True)
        
        # Write back
        conn.update(worksheet="logs", data=updated_df)
        st.success("Log Synced to Google Sheets!") # This will confirm it worked
        return True
    except Exception as e:
        st.error(f"Error saving to Sheet: {e}")
        return False

# --- APP UI ---
st.title("💧 H2O PRO | Hydration Tracker")

# PRE-ADDED NAMES: Change these to your actual team names
team_members = ["Weylu", "Amar", "Becca", "Giovanna", "Lindsey"]
selected_user = st.selectbox("Select Athlete/Coach", team_members)

weight_kg = st.number_input("Weight (kg)", min_value=30, value=80, step=1)
daily_goal_oz = round((weight_kg / 20) * 33.814)

# Current Progress Calculation
df = load_data()
today = datetime.now().strftime('%Y-%m-%d')

# Filtering out dummy/old data: only show today's logs for the selected user
current_total = 0
if not df.empty:
    user_today = df[(df['User'] == selected_user) & (df['Date'] == today)]
    current_total = user_today['Intake'].sum()

# --- DASHBOARD ---
st.markdown(f"### Target: {daily_goal_oz} oz")
progress = min(current_total / daily_goal_oz, 1.0)
st.progress(progress)
st.metric("Current Intake", f"{int(current_total)} oz", f"{int(daily_goal_oz - current_total)} oz left")

# --- INPUTS ---
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("+8oz"): 
        save_data(selected_user, 8, daily_goal_oz)
        st.rerun()
with col2:
    if st.button("+16oz"): 
        save_data(selected_user, 16, daily_goal_oz)
        st.rerun()
with col3:
    if st.button("+32oz"): 
        save_data(selected_user, 32, daily_goal_oz)
        st.rerun()

custom_amt = st.number_input("Add Custom Amount", min_value=0, step=1)
if st.button("Log Custom Amount"):
    save_data(selected_user, custom_amt, daily_goal_oz)
    st.rerun()

# --- LEADERBOARD ---
st.divider()
st.subheader("🏆 Team Leaderboard (Today)")
if not df.empty:
    league = df[df['Date'] == today].groupby('User').agg({'Intake': 'sum', 'Goal': 'max'})
    if not league.empty:
        league['% of Goal'] = (league['Intake'] / league['Goal'] * 100).astype(int)
        # Sorting by hydration percentage
        st.dataframe(league[['% of Goal']].sort_values(by='% of Goal', ascending=False), use_container_width=True)
    else:
        st.write("No entries yet for today.")
