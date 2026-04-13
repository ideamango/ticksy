import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { sequelize, User, List } from './db';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

app.use(async (req, res, next) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'Missing x-user-id header' });
    return;
  }
  
  try {
    const [user, created] = await User.findOrCreate({ where: { userId } });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

app.post('/create-list', async (req, res) => {
  try {
    const { listId, title, categoryId, emoji, items } = req.body;
    const userId = req.headers['x-user-id'] as string;

    const newList = await List.create({
      listId,
      ownerId: userId,
      sharedWith: [],
      title,
      categoryId,
      emoji,
      items: items || [],
    });

    res.json(newList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

app.get('/my-lists', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const allLists = await List.findAll();
    const myLists = allLists.filter((l: any) => l.ownerId === userId || (l.sharedWith && l.sharedWith.includes(userId)));

    res.json(myLists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.get('/list/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    const list: any = await List.findByPk(id);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (list.ownerId !== userId && (!list.sharedWith || !list.sharedWith.includes(userId))) {
      let shared = list.sharedWith || [];
      if (!Array.isArray(shared)) shared = [];
      shared.push(userId);
      list.sharedWith = shared;
      list.changed('sharedWith', true);
      await list.save();
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

app.put('/update-item', async (req, res) => {
  try {
    const { listId, items, patch } = req.body;
    const userId = req.headers['x-user-id'] as string;
    
    const list: any = await List.findByPk(listId);
    if (!list) {
       res.status(404).json({ error: 'List not found' });
       return;
    }
    
    if (list.ownerId !== userId && (!list.sharedWith || !list.sharedWith.includes(userId))) {
       res.status(403).json({ error: 'Forbidden' });
       return;
    }

    if (items) {
      list.items = items;
      list.changed('items', true);
    }
    
    if (patch) {
       if (patch.title !== undefined) list.title = patch.title;
       if (patch.categoryId !== undefined) list.categoryId = patch.categoryId;
       if (patch.emoji !== undefined) list.emoji = patch.emoji;
    }
    
    await list.save();

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update items' });
  }
});

app.delete('/list/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const list: any = await List.findByPk(id);
    if (list && list.ownerId === userId) {
      await list.destroy();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

io.on('connection', (socket) => {
  socket.on('join-list', (listId) => {
    socket.join(listId);
  });

  socket.on('leave-list', (listId) => {
    socket.leave(listId);
  });

  socket.on('list-updated', ({ listId, items, patch, senderId }) => {
    socket.to(listId).emit('list-sync', { listId, items, patch, senderId });
  });
});

sequelize.sync({ alter: true }).then(() => {
  server.listen(4000, () => {
    console.log('Backend listening on port 4000');
  });
});
