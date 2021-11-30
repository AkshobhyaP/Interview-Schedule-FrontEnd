import React, { useEffect, useState } from 'react';
import './App.css';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'
import Axios from "axios"

function App() {

  const [selectedDate, setSelectedDate] = useState("")
  const [startTime, startTimeChange] = useState('10:00')
  const [endTime, endTimeChange] = useState('10:00')
  const [participant, particpantChange] = useState([])
  const [options, optionsChange] = useState([])
  const [allInterview, allInterviewsChange] = useState([])

  const inputStyle = {
    display: 'flex',
    width: '250px',
    margin: '10px',
    flexDirection: 'column'
  }
  const rowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    padding: '10px',
    color: 'rgb(63, 179, 247)'
  }

  useEffect(() => {
    getAllInterviews()
    getEmail()
  }, []);

  const getEmail = async () => {
    const res = []
    Axios.get('https://interview-schedulor.herokuapp.com/api/get/email').then((response) => {
      console.log(response)
      response.data.forEach((item) => {
        const obj = { label: item.email, value: item.email }
        res.push(obj)
      })
    })
    optionsChange(res)
  }

  const getAllInterviews = async () => {
    const res = []
    Axios.get('https://interview-schedulor.herokuapp.com/api/get/interview').then((response) => {
      console.log(response)
      response.data.forEach((item) => {
        var participantString = ""
        let obj = JSON.parse(item.participants)
        obj.forEach((val) => {
          participantString += val.value + ", "
        })
        item["participantString"] = participantString
        res.push(item)
      })
      res.sort(function (a, b) {
        return a.date.localeCompare(b.date);
      });
      allInterviewsChange(res)
    })
  }

  function getRndInteger() {
    return Math.floor(Math.random() * (100000 - 0)) + 0;
  }

  const checkDetails = () => {
    var flag = true
    if (startTime.localeCompare(endTime) === 1) { flag = false; }
    if (participant.length < 2) { flag = false; }
    if (selectedDate === null) { flag = false; }
    if (flag === false) alert("Please fill all the details completely.")
    return flag
  }
  const checkPreviousInterview = () => {
    var flag = true;
    allInterview.forEach((interview) => {
      if (interview.date.localeCompare(JSON.stringify(selectedDate)) === 0) {
        if ((startTime.localeCompare(interview.startTime) >= 0 && interview.endTime.localeCompare(startTime) >= 0) ||
          (endTime.localeCompare(interview.startTime) >= 0 && interview.endTime.localeCompare(endTime) >= 0)) {
          let participantObj = JSON.parse(interview.participants)
          participant.forEach((current) => {
            participantObj.forEach((previous) => {
              if (JSON.stringify(current) === JSON.stringify(previous)) {
                flag = false;
              }
            })
          })
        }
      }
    })

    if (flag === false) alert("Interview with clashing time and participants already exists")
    return flag
  }

  const submit = async () => {
    if (checkDetails() === false) return
    if (checkPreviousInterview() === false) return
    const participantobject = JSON.stringify(participant);
    Axios.post('https://interview-schedulor.herokuapp.com/api/insert', {
      idSchedule: getRndInteger(),
      date: JSON.stringify(selectedDate),
      startTime: startTime,
      endTime: endTime,
      participants: participantobject
    }).then((response, error) => {
      getAllInterviews();
      alert('Successfully Inserted')
    })
  };

  const edit = async (interview) => {
    var id = interview.idSchedule
    Axios.delete(`https://interview-schedulor.herokuapp.com/api/delete/${id}`).then((response) => {
      getAllInterviews()
      setSelectedDate(new Date(interview.date.substring(1, 11)))
      startTimeChange(interview.startTime)
      endTimeChange(interview.endTime)
      particpantChange(JSON.parse(interview.participants))
    })
  }

  return (
    <div className="App">

      <div>
        <h1 style={{ color: 'rgb(63, 179, 247)' }}>
          Interview Scheduling Portal
        </h1>
      </div>
      <div style={rowStyle}>
        <div style={inputStyle}>
          <label>Date</label>
          <DatePicker
            selected={selectedDate}
            dateFormat='dd/MM/yyyy'
            onChange={date => setSelectedDate(date)}
          />
        </div>
        <div style={inputStyle}>
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            required
            onChange={(e) => startTimeChange(e.target.value)}
          />
        </div>
        <div style={inputStyle}>
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            required
            onChange={(e) => endTimeChange(e.target.value)}
          />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={inputStyle}  >
          <label>Participants</label>
          <Select options={options}
            value={participant}
            isMulti='true'
            onChange={particpantChange}
          />

        </div>
      </div>
      <div style={rowStyle}>
        <div style={inputStyle}  >
          <button onClick={submit} style={{ background: 'rgb(63, 179, 247)', padding: '10px', borderRadius: '5px', color: 'white' }}>
            Schedule
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ color: 'rgb(63, 179, 247)' }}>
          Upcoming Interviews
        </h2>
        <table >
          <thead >
            <tr>
              <th scope="col">Interview Id</th>
              <th scope="col">Date</th>
              <th scope="col">Start Time</th>
              <th scope="col">End Time</th>
              <th scope="col">Participants</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allInterview.map((interview) => (
              <tr  >
                <td>{interview.idSchedule}</td>
                <td>{interview.date.substring(1, 11)}</td>
                <td>{interview.startTime}</td>
                <td>{interview.endTime}</td>
                <td>{interview.participantString}</td>
                <td>
                  <button onClick={() => edit(interview)}
                  >
                    Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
