import React, { useEffect } from "react";

const Chatbot = () => {
  useEffect(() => {
    const loadChatbox = async () => {
      try {
        const ChatboxModule = await import(
          "https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js"
        );
        const Chatbox = ChatboxModule.default || ChatboxModule;

        const widget = await Chatbox.initBubble({
          agentId: "cmha08slf0kgfk70v594yxt9k", 
          contact: { firstName: "Karney" },
        });

        widget.open();
      } catch (err) {
        console.error(err);
      }
    };

    loadChatbox();
  }, []);

  return null;
};

export default Chatbot;
