import axios from "axios";

// Define action types as constants
const DATA_REQUEST = "DATA_REQUEST";
const DATA_SUCCESS = "DATA_SUCCESS";
const DATA_FAILURE = "DATA_FAILURE";
const SELECT_DATA_REQUEST = "SELECT_DATA_REQUEST";
const SELECT_DATA_SUCCESS = "SELECT_DATA_SUCCESS";
const SELECT_DATA_FAILURE = "SELECT_DATA_FAILURE";

// Fetch all data
export const fetchAllData = () => async (dispatch) => {
  dispatch({ type: DATA_REQUEST });
  try {
    const { data } = await axios.get("https://api.quicksell.co/v1/internal/frontend-assignment/");
    dispatch({ type: DATA_SUCCESS, payload: data });
  } catch {
    dispatch({ type: DATA_FAILURE });
  }
};

// Group data by status, user, or priority, and apply sorting based on orderValue
export const selectData = (group, allTickets, orderValue) => async (dispatch) => {
  dispatch({ type: SELECT_DATA_REQUEST });
  try {
    let selectedData = [], groupData, user = false;

    switch (group) {
      case "status":
        selectedData = groupBy(allTickets, "status");
        break;
      case "user":
        user = true;
        selectedData = allTickets?.allUser?.map((user, idx) => ({
          [idx]: {
            title: user.name,
            value: allTickets.allTickets.filter(ticket => ticket.userId === user.id),
          },
        }));
        break;
      default:
        const priorities = ["No priority", "Urgent", "High", "Medium", "Low"];
        selectedData = priorities.map((priority, idx) => ({
          [idx]: {
            title: priority,
            value: allTickets.filter(ticket => ticket.priority === idx),
          },
        }));
    }

    if (orderValue) {
      selectedData.forEach((group, idx) => {
        group[idx]?.value?.sort((a, b) =>
          orderValue === "title" ? a.title.localeCompare(b.title) : b.priority - a.priority
        );
      });
    }

    dispatch({ type: SELECT_DATA_SUCCESS, payload: { selectedData, user } });
  } catch (error) {
    dispatch({ type: SELECT_DATA_FAILURE, payload: error.message });
  }
};

// Helper function to group data by a specific key
const groupBy = (data, key) => {
  const grouped = [...new Set(data.map(item => item[key]))].map((group, idx) => ({
    [idx]: {
      title: group,
      value: data.filter(item => item[key] === group),
    },
  }));
  return grouped;
};
