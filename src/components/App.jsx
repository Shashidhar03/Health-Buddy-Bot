import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState({ text: '', sender: '' });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clickHey, setClickHey] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function onHeyClick() {
    setClickHey(true);

    // Add user's "Hey" message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: 'Hey', sender: 'user' },
    ]);

    // Simulate bot responses after "Hey" is clicked
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

  function handleSubmit(event) {
    event.preventDefault();

    if (message.text.trim()) {

      // Add user message to messages array
      setMessages([...messages, { text: message.text, sender: 'user' }]);

      // Clear input and set loading indicator
      setMessage({ text: '', sender: '' });
      //to create illusion of loading
      setIsLoading(true);

      // Placeholder for bot response - replace with actual backend call
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'This is a response from the bot!', sender: 'bot' },
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }

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
              } `}
            >
              {msg.text}
            </div>
          ))}

          {/* Loading Indicator for bot response */}
          {isLoading && (
            <div className="my-2 p-2 rounded-md bg-gray-200 text-black self-start mr-auto max-w-xs">
              Bot is typing...
            </div>
          )}

          {/* Dummy div to auto-scroll to the latest message */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}

        {clickHey ? 
            (
            <form onSubmit={handleSubmit} className="flex items-center p-4 border-t">
            <input
              type="text"
              placeholder="Type your message..."
              value={message.text}
              onChange={(e) => setMessage({ text: e.target.value, sender: 'user' })}
              className="flex-grow p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
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
        
        
      </div>
    </div>
  );
}

export default App;
