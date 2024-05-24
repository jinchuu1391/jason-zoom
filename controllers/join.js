import url from 'url'
import {v4} from 'uuid'

export const joinView = (req, res) => {
    res.redirect(
        url.format({
            pathname: `/join/${v4()}`,
            query: req.query
        })
    )
}

export const joinOldView = (req, res) => {
    res.redirect(
        url.format({
            pathname: req.query.meeting_id,
            query: req.query,
        })
    )
}

export const joinRoomView = (req, res) => {
    res.render('room', {roomid: req.params.rooms, Myname: req.query.name});
}
