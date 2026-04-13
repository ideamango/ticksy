import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { Request, Response } from 'express';
import { env } from './config/env';
import { createRequireUserMiddleware } from './middleware/require-user';
import { KvClient } from './lib/kv-client';
import { ListRepository } from './repositories/list-repository';
import { UserRepository } from './repositories/user-repository';
import { ForbiddenError, ListService, NotFoundError } from './services/list-service';
import { AuthService } from './services/auth-service';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

const kvClient = new KvClient();
const userRepository = new UserRepository(kvClient);
const listRepository = new ListRepository(kvClient);
const authService = new AuthService(userRepository);
const listService = new ListService(listRepository, userRepository);

function getUserId(req: Request): string {
  return req.userId as string;
}

function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

function requireNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getRequiredParam(req: Request, key: string): string | null {
  const value = req.params[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

async function handleCreateList(req: Request, res: Response) {
  const { listId, title, categoryId, emoji, items } = req.body;
  if (!requireNonEmptyString(listId)) {
    return badRequest(res, 'listId is required');
  }
  if (!requireNonEmptyString(title)) {
    return badRequest(res, 'title is required');
  }

  const newList = await listService.createList(getUserId(req), {
    listId,
    title: title.trim(),
    categoryId,
    emoji,
    items: Array.isArray(items) ? items : [],
  });

  return res.json(newList);
}

async function handleGetMyLists(req: Request, res: Response) {
  const myLists = await listService.getMyLists(getUserId(req));
  return res.json(myLists);
}

async function handleGetList(req: Request, res: Response) {
  const id = getRequiredParam(req, 'id');
  if (!id) {
    return badRequest(res, 'id is required');
  }
  const list = await listService.fetchAndJoin(id, getUserId(req));
  return res.json(list);
}

async function handleUpdateList(req: Request, res: Response) {
  const requestedListId = req.params.id || req.body.listId;
  if (!requireNonEmptyString(requestedListId)) {
    return badRequest(res, 'listId is required');
  }

  const { items, patch } = req.body;
  if (items === undefined && patch === undefined) {
    return badRequest(res, 'Either items or patch is required');
  }

  const list = await listService.updateList(requestedListId, getUserId(req), { items, patch });
  return res.json(list);
}

async function handleDeleteList(req: Request, res: Response) {
  const id = getRequiredParam(req, 'id');
  if (!id) {
    return badRequest(res, 'id is required');
  }
  await listService.deleteList(id, getUserId(req));
  return res.json({ success: true });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ticksy-server' });
});

app.post('/auth/login', async (req, res) => {
  try {
    const preferredUserId = typeof req.body?.userId === 'string' ? req.body.userId : undefined;
    const result = await authService.login(preferredUserId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.use(createRequireUserMiddleware(authService));

app.get('/auth/me', async (req, res) => {
  try {
    const user = await authService.getUser(getUserId(req));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/create-list', async (req, res) => {
  try {
    await handleCreateList(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

app.post('/lists', async (req, res) => {
  try {
    await handleCreateList(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

app.get('/my-lists', async (req, res) => {
  try {
    await handleGetMyLists(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.get('/lists', async (req, res) => {
  try {
    await handleGetMyLists(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.get('/list/:id', async (req, res) => {
  try {
    await handleGetList(req, res);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

app.get('/lists/:id', async (req, res) => {
  try {
    await handleGetList(req, res);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

app.put('/update-item', async (req, res) => {
  try {
    await handleUpdateList(req, res);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update items' });
  }
});

app.put('/lists/:id', async (req, res) => {
  try {
    await handleUpdateList(req, res);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

app.delete('/list/:id', async (req, res) => {
  try {
    await handleDeleteList(req, res);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/lists/:id', async (req, res) => {
  try {
    await handleDeleteList(req, res);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete list' });
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

server.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});
