import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { CodemirrorBinding } from "y-codemirror";
import "./Editor.css";
import "./EditorAddons";

export default function Editor() {
    const { roomName } = useParams();

    const [language, setLanguage] = useState("python");
    const [theme, setTheme] = useState("monokai");
    const editorRef = useRef(null);
    const [code, setCode] = useState("");
    const [fontSize, setFontSize] = useState("medium");
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);


    useEffect(() => {
        if (editorRef.current) {
            const ydoc = new Y.Doc();

            const provider = new WebrtcProvider(roomName, ydoc, {
                signaling: ['ws://localhost:4444', 'wss://signaling.yjs.dev']
            });


            const yText = ydoc.getText('codemirror');
            const yUndoManager = new Y.UndoManager(yText);

            const userName = 'Anonymous' + Math.floor(Math.random() * 16777215);
            const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

            const awareness = provider.awareness;

            awareness.setLocalStateField('user', {
                name: userName,
                color: userColor
            });

            const binding = new CodemirrorBinding(yText, editorRef.current, awareness, {
                yUndoManager
            });

            return () => {
                binding.destroy();
                provider.disconnect();
                ydoc.destroy();
            };
        }
    }, []);

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
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setShowCopiedMessage(true);
                setTimeout(() => setShowCopiedMessage(false), 2000); // Hide message after 2 seconds
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
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
                            Copy Link
                        </button>
                        <span className={`link-copied-message ${showCopiedMessage ? 'show' : ''}`}>
                            Link copied!
                        </span>
                    </div>
                </div>
            </div>

            <div className="editor-content" style={{ flex: 1 }}>
                <CodeMirrorEditor
                    onChange={(editor, data, value) => {
                        // Handle changes if needed
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
        </div >
    );
}