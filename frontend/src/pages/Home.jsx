import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note";
import "../style/Home.css";

function Home() {
    // we want to send an authorized request to get all the notes we created
    const [notes, setNotes] = useState([]);
    // need a state for the form on this note, to be able to create a new node 
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("")

    useEffect(() => {
        getNotes();
    }, [])

    const getNotes = () => {
        api
        .get("/api/notes/")
        .then((res) => res.data)
        .then((data) => { setNotes(data); console.log(data) })
        .catch((err) => alert(err));
    }

    // delete nodes
    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`).then((res) => {
            if (res.status === 204) alert("Note deleted!")
            else alert("Failed to delete note.")
            getNotes() // show update on screen, other way is writing it on frontend with states
        }).catch((error) => alert(error))
    }

    // create new note
    const createNote = (e) => {
        e.preventDefault()
        api.post("/api/notes/", {content, title}).then((res) => {
            if (res.status === 201) alert("Note created!")
            else alert("Failed to make note.")
            getNotes()
        }).catch((err) => alert(err))
    }

    return (
        <div>
            <div>
                <h2>Notes</h2>
                {notes.map((note) => (
                    <Note note={note} onDelete={deleteNote} key={note.id} /> 
                ))}
            </div>

            <h2>Create a Note</h2>
            <form onSubmit={createNote}>
                <label htmlFor="title">Title:</label>
                <br/>
                <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    required 
                    onChange={(e) => setTitle(e.target.value)} 
                    value = {title}
                />
                <label htmlFor="content">Content:</label>
                <br/>
                <textarea id="content" name="content" required value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                <br/>
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
}

export default Home