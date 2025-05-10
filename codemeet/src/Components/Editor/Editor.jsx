import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { CodemirrorBinding } from "y-codemirror";
import Peer from "peerjs";

import "./Editor.css";
import "./EditorAddons";

export default function Editor() {
    const { roomName } = useParams();

    const [meetingName, remotepeerID] = roomName.split('&&');

    const [language, setLanguage] = useState("python");
    const [theme, setTheme] = useState("monokai");
    const editorRef = useRef(null);
    const [code, setCode] = useState("");
    const [fontSize, setFontSize] = useState("medium");
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [userName, setUserName] = useState("");
    const [this_peer, setPeer] = useState(null);
    const [connection, setConnection] = useState(null);
    const [this_peerId, setPeerId] = useState('');


    useEffect(() => {
        const generatedUserName = 'Anonymous' + Math.floor(Math.random() * 16777215);
        setUserName(generatedUserName);

        if (editorRef.current) {
            const ydoc = new Y.Doc();

            const provider = new WebrtcProvider(meetingName, ydoc, {
                signaling: [process.env.REACT_APP_SIGNALING]
            });


            const yText = ydoc.getText('codemirror');
            const yUndoManager = new Y.UndoManager(yText);

            const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

            const awareness = provider.awareness;

            awareness.setLocalStateField('user', {
                name: generatedUserName,
                color: userColor
            });

            const binding = new CodemirrorBinding(yText, editorRef.current, awareness, {
                yUndoManager
            });

            console.log('Connected to room: ' + meetingName);

            const peer = new Peer();

            peer.on('open', (id) => {
                setPeerId(id);
            });

            peer.on('connection', (conn) => {
                conn.on('data', (data) => {
                    setChatMessages((prevMessages) => [...prevMessages, { text: data, received: true }]);
                });
                setConnection(conn);
            });

            setPeer(peer);

            if (remotepeerID !== "-" && this_peer) {
                const conn = this_peer.connect(remotepeerID);
                conn.on('open', () => {
                    conn.on('data', (data) => {
                        setChatMessages((prevMessages) => [...prevMessages, { text: data, received: true }]);
                    });
                    setConnection(conn);
                });
            }

            return () => {
                binding.destroy();
                provider.disconnect();
                ydoc.destroy();
                peer.destroy();
            };
        }
    }, [roomName]);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        editor.setValue(""); // Set initial value to empty string
        editor.setSize("100%", "100%");
        updateFontSize(fontSize);
    };

    const updateFontSize = (size) => {
        if (editorRef.current) {
            const sizes = {
                small: "15px",
                medium: "20px",
                large: "25px"
            };
            editorRef.current.getWrapperElement().style.fontSize = sizes[size];
            editorRef.current.refresh();
        }
    };

    const handleFontSizeChange = (e) => {
        const newSize = e.target.value;
        setFontSize(newSize);
        updateFontSize(newSize);
    };

    const copyLinkToClipboard = () => {
        navigator.clipboard.writeText(meetingName + "&&" + this_peer.id)
            .then(() => {
                setShowCopiedMessage(true);
                setTimeout(() => setShowCopiedMessage(false), 2000); // Hide message after 2 seconds
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const sendMessage = () => {
        if (connection && inputMessage) {
            connection.send(inputMessage);
            setChatMessages((prevMessages) => [...prevMessages, { text: inputMessage, received: false }]);
            setInputMessage('');
        }
    };


    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div className="toolbar">
                <div className="editor-toolbar">
                    <label className="editor-label">
                        Language:
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="editor-select"
                        >
                            {/* Options for languages */}
                            <option value="c">C</option>
                            <option value="c++">C++</option>
                            <option value="go">Go</option>
                            <option value="haskell">Haskell</option>
                            <option value="javascript">JavaScript</option>
                            <option value="lua">Lua</option>
                            <option value="pascal">Pascal</option>
                            <option value="perl">Perl</option>
                            <option value="php">PHP</option>
                            <option value="python">Python</option>
                            <option value="r">R</option>
                            <option value="rust">Rust</option>
                            <option value="ruby">Ruby</option>
                            <option value="shell">Shell</option>
                            <option value="sql">SQL</option>
                            <option value="swift">Swift</option>

                        </select>
                    </label>
                    <label className="editor-label">
                        Theme:
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="editor-select"
                        >
                            {/* Options for themes */}
                            <option value="monokai">Monokai</option>
                            <option value="dracula">Dracula</option>
                            <option value="ambiance">Ambiance</option>
                            <option value="material-darker">Material Darker</option>
                            <option value="material-palenight">Material Palenight</option>
                            <option value="mdn-like">MDN Like</option>
                            <option value="eclipse">Eclipse</option>
                        </select>
                    </label>
                    <label className="editor-label">
                        Font Size:
                        <select
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            className="editor-select"
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button onClick={copyLinkToClipboard} className="copy-link-button">
                            Copy Room ID
                        </button>
                        <span className={`link-copied-message ${showCopiedMessage ? 'show' : ''}`}>
                            Link copied!
                        </span>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="editor-content">
                    <CodeMirrorEditor
                        onChange={(editor, data, value) => {
                            setCode(value);
                        }}
                        options={{
                            mode: language,
                            theme: theme,
                            lineWrapping: true,
                            smartIndent: true,
                            lineNumbers: true,
                            foldGutter: true,
                            tabSize: 2,
                            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                            autoCloseTags: true,
                            matchBrackets: true,
                            autoCloseBrackets: true,
                            extraKeys: {
                                "Ctrl-Space": "autocomplete",
                            },
                        }}
                        editorDidMount={handleEditorDidMount}
                    />
                </div>

                <div className="chat-window">
                    <div className="chat-messages">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className="chat-message">
                                <strong>{msg.user}:</strong> {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>

            </div>

        </div >
    );
}