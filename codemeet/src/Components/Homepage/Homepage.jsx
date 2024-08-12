import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

import './Homepage.css';

export default function HomePage() {
    const [roomName, setRoomName] = useState('');
    const navigate = useNavigate();

    const createNewRoom = () => {
        const newRoomId = uuidv4();
        navigate(`/room/${newRoomId}`);
    };

    const joinExistingRoom = (e) => {
        e.preventDefault();
        if (roomName) {
            if (uuidValidate(roomName)) {
                navigate(`/room/${roomName}`);
            } else {
                alert("Please enter a valid room ID (UUID format)!");
            }
        } else {
            alert("Please enter a room ID");
        }
    };

    return (
        <div className="homepage">
            <h1>CodeMeet</h1>
            <div className="under-development">Under Development</div>
            <h3> The platform to meet and code together - privately.</h3>
            <button onClick={createNewRoom}>Create New Room</button>
            <div className="or-text">or</div>
            <form onSubmit={joinExistingRoom}>
                <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter existing room name"
                />
                <button type="submit">Join Existing Room</button>
            </form>
        </div>
    );
}