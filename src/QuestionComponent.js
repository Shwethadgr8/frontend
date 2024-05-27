import React, { useState } from 'react';
import axios from 'axios';

const QuestionComponent = () => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async () => {
    // Update chat history with user message
    setChatHistory([...chatHistory, { user: question, type: 'user' }]);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/chat', {
        question,
        chat_history: ''
      });
      console.log(response.data);
      if (response.data) {
        // Add bot's message to chat history after receiving the response
        setChatHistory(prevChatHistory => [
          ...prevChatHistory,
          { bot: response.data, type: 'bot' }
        ]);
        setQuestion('');
        setError('');
      } else {
        setError('No answer received from the server.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error occurred while fetching the answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-300">
      <div className="flex-1 overflow-auto p-4" id="chat-history">
      {chatHistory.map((item, index) => (
  <div key={index} className={`flex items-start gap-2.5 ${item.type === 'user' ? 'justify-end' : ''}`}>
    {item.type === 'user' ? (
      <div className="flex items-start gap-2.5 mb-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="User image" />
          <div className="flex flex-col min-w-[600px] max-w-[600px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">You</span>
            </div>
            <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{item[item.type]}</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex items-start gap-2.5 mb-10">
        <img className="w-8 h-8 rounded-full" src="/bot.jpg" alt="Jese image" />
        <div className="flex flex-col min-w-[600px] max-w-[600px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Bot</span>
          </div>
          <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{item[item.type]}</p>

        </div>
        
        
      </div>
    )}
  </div>
))}

        {loading && (
          <div className="flex flex-row gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
        </div>
        )}
      </div>
      <div className="flex items-center p-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-4 py-2 mr-4 bg-gray-700 border border-gray-500 rounded text-gray-200"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-700 hover:bg-indigo-900 text-white rounded font-bold"
          disabled={loading || !question.trim()}
        >
          {loading ? 'Thinking...' : 'Submit'}
        </button>
        {loading && (
          <div className="ml-2 border border-blue-500 rounded-full h-6 w-6 border-t-0 border-4 animate-spin"></div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-red-500 text-center">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
};

export default QuestionComponent;
