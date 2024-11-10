import React, { useState, useRef, useEffect } from 'react';
import recording from "../assets/record.gif"

function App() {
    //messages info
  const [message, setMessage] = useState({ text: '', sender: '' });
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [clickHey, setClickHey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  let recognition;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  // User info
  const [userInfo, setUserInfo] = useState({ name: '', age: '', gender: '' });
  const [symptoms, setSymptoms] = useState([]);
  const [disease,setDisease] = useState('');
  const [step, setStep] = useState(1);

  //console.log(userInfo);
  //console.log(symptoms);

  //Doctors info
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState({
    id: null,
    name: '',
    availableDates: []
  });
  const [availableSlots, setAvailableSlots] = useState([]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, clickHey,step,userInfo,symptoms]);

  function onHeyClick() 
  {
        setClickHey(true);

        // Add user's "Hey" message to the messages array
        setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Hey', sender: 'user' },
        ]);

        // first bot responses after "Hey" is clicked
        setTimeout(() => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Hello user', sender: 'bot' },
        ]);

        // Second bot message after a delay
        setTimeout(() => {
            setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'What is your name?', sender: 'bot' },
            ]);
            }, 1000);
        }, 1000);
  }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    async function handleSubmit(event) 
    {
        event.preventDefault();

        if (!message.text.trim()) return;

        // Add user message to messages array
        setMessages([...messages, { text: message.text, sender: 'user' }]);

        // Process user input based on the current step
        if (step === 1)
        {
            await sleep(2000);
            setUserInfo((prevInfo) => ({ ...prevInfo, name: message.text }));

            setMessages((prevMessages) => [
                ...prevMessages,
                { text:'Hello '+userInfo.name+ ', What is your age?', sender: 'bot' },
            ]);
            setStep(2);
        } 
        else if (step === 2) 
        {
            await sleep(2000);
            setUserInfo((prevInfo) => ({ ...prevInfo, age: message.text }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'What is your gender?', sender: 'bot' },
            ]);

            //call to backend to send userinfo data
            // in response mongodb id wii be sent to frontend
            // store id in localstorage
            setStep(3);

            
        } 
        
        else if (step === 3) 
        {
            await sleep(2000);
            setUserInfo((prevInfo) => ({ ...prevInfo, gender: message.text }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'What problems are you facing?', sender: 'bot' },
            ]);
            setStep(4);
            
        } 
        else if (step === 4) 
        {
            await sleep(2000);
            //const symptomsArray = message.text.split(',').map(symptom => symptom.trim());
           console.log(message.text);
           const strobj = {
            "symtext":message.text
           }
            // const symptomsArray = message.text.split(',').map(symptom => symptom.trim());
            const sent = await fetch('http://localhost:5000/nlp',{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(strobj),
            })
            const symptomsArray = await sent.json();

            if (symptomsArray.length === 5) {
                setSymptoms(symptomsArray);
                setMessages((prevMessages) => [
                ...prevMessages,

                { text: `Thank You`, sender: 'bot' },
                ]);
                 // End of sequence, we can data here to backend as symptoms array

            console.log({userInfo,symptomsArray});
             
      
            
              try {
                const response = await fetch('http://localhost:5000/api/patients', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({userInfo,symptomsArray}),
                });
                
          
                const data = await response.json();
                console.log("12354");
                console.log(data);
                setDisease((data) => data);
                console.log(disease);
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { text: data, sender: 'bot' },
                  ]);

                  setStep(5);

                if (response.ok) {
                  console.log('Data sent successfully:', data);
                } else {
                  console.error('Failed to send data:', data.error);
                }
              } catch (error) {
                console.error('Error sending data:', error);
              }
            
            } 
            else
            {
                setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Please enter exactly five symptoms, separated by commas.', sender: 'bot' },
                ]);
            }
        }
        else if (step === 6 && selectedDoctor) 
        {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: `Your slot with Dr. ${selectedDoctor.name} has been booked.`, sender: 'bot' },
                { text: 'Thank you for booking the slot.', sender: 'bot' }
            ]);
            setStep(7);
        }
        else
        {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: 'for any query about other disease, enter 5 more symptoms else close the chat', sender: 'bot' },
            ]);
            setStep(4);
        }
        console.log(message);
        // Clear input and stop loading
        setMessage({ text: '', sender: '' });
      }        
      
      

        

        
    
    

    function handleAppointmentResponse(response) {
        if (response === 'yes') {
            // here we can fetch doctors from backend and set in doctors data
        //   fetchDoctors();
          const doctorsData = [
            { id: 1, name: 'Dr. Smith', availableDates: ['2024-11-12', '2024-11-13'] },
            { id: 2, name: 'Dr. Johnson', availableDates: ['2024-11-14', '2024-11-15'] },
          ];
          setDoctors(doctorsData);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Here are the available doctors:', sender: 'bot' },
          ]);
          setStep(6);

        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Okay, thankyou', sender: 'bot' },
          ]);
          setStep(7);
        }
      }

    //   function fetchDoctors() {
    //     const doctorsData = [
    //       { id: 1, name: 'Dr. Smith', availableDates: ['2024-11-12', '2024-11-13'] },
    //       { id: 2, name: 'Dr. Johnson', availableDates: ['2024-11-14', '2024-11-15'] },
    //     ];
    //     setDoctors(doctorsData);
    //     setMessages((prevMessages) => [
    //       ...prevMessages,
    //       { text: 'Here are the available doctors:', sender: 'bot' },
    //     ]);
    //     setStep(6);
    //   }

      function handleDoctorSelection(doctor) {
        setSelectedDoctor(doctor);
    
        // here go through all the slots(which is response from backend )and create json {slots.date , slots.time} and add in slots
        const slots = doctor.availableDates.map((date) => `${date} 10:00 AM`);

        setAvailableSlots(slots);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Select a time slot for Dr. ${doctor.name}:`, sender: 'bot' },
        ]);
        setStep(6.5);
      }

      function handleSlotSelection(slot) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `You selected ${slot} for Dr. ${selectedDoctor.name}. Slot is booked.`, sender: 'bot' },
        ]);
        //call to backend to block selected slot in backend
        // data to be sent to backend is selectedDoctor.id, slot.time, and id(id which is stored in localstorage at line 91)
        setAvailableSlots([]);
        setStep(7);
      }
    //////////////////////////////////////speech to text
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
          setIsProcessing(true); // Set processing to true when recognition starts
      };

      recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');
          setMessage({ text: transcript, sender: 'user' });
      };

      recognition.onend = () => {
          setIsProcessing(false);
          setIsListening(false);
      };
  }

  const toggleListening = () => {
      if (isListening) {
          recognition.stop();
      } else {
          recognition.start();
      }
      setIsListening(!isListening);
  };


  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-teal-400 via-blue-400 to-purple-500 overflow-hidden">
      
      {/* Chatbot container */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-center p-4 bg-blue-600 text-white">
          Health Buddy
        </h1>

        {/* Chat Messages */}
        <div className="p-4 max-h-72 overflow-y-auto overflow-x-hidden">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`my-2 p-3 rounded-md whitespace-pre-wrap break-words ${
                msg.sender === 'user'
                  ? 'w-auto max-w-60 h-auto bg-blue-600 rounded-lg rounded-br-none m-3 float-end clear-both p-2 text-white'
                  : 'w-auto max-w-60 h-auto bg-slate-100 rounded-lg rounded-tl-none m-3 float-start clear-both p-2'
              } `}>
              {msg.text}
              {/* Dummy div to auto-scroll to the latest message */}
              <div ref={messagesEndRef} />
            </div>
          ))}
        </div>
          

        {/* Chat Input */}

        {clickHey ? 
            (
                <form onSubmit={handleSubmit} className="flex items-center p-4 border-t">
                    <input type="text" placeholder="Type your message..." value={message.text}
                        onChange={(e) => setMessage({ text: e.target.value, sender: 'user' })}
                        className="flex-grow p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    {!isProcessing ? <button type="submit"  className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"> Send </button> : <img src={recording} width="40px" alt='recording'/>}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`ml-2 p-2 ${isListening ? 'bg-red-600' : 'bg-gray-600'} text-white rounded-lg hover:bg-gray-700`}
                    >
                    {isListening ? 'Stop' : '🎤'}
                  </button>     
                </form>
            ) : 
            (
                <button onClick={onHeyClick}
                    className="flex items-center justify-center px-6 py-3 mx-auto my-1 bg-gradient-to-r from-teal-400 to-blue-500
                     text-white font-semibold rounded-full shadow-lg hover:from-teal-500 hover:to-blue-600 hover:scale-105 
                     transform transition-all duration-300 ease-in-out">
                     Hey
                </button>

            )
        }

        {step === 5 && (
            <div className="flex justify-around p-4">
              <button
                onClick={() => handleAppointmentResponse('yes')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => handleAppointmentResponse('no')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                No
              </button>
            </div>
          )}
  
          {step === 6 && (
            <div className="p-4">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleDoctorSelection(doctor)}
                  className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {doctor.name}
                </button>
              ))}
            </div>
          )}
  
          {step === 6.5 && (
            <div className="p-4">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelection(slot)}
                  className="w-full mb-2 px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
           
      </div>
    </div>
  );
}

export default App;
