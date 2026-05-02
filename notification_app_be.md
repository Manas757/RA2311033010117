# Notification System Design

## Stage 1: REST API Design

**1. Fetch Notifications**
* **Endpoint:** `GET /api/v1/notifications`
* **Headers:** `Authorization: Bearer <token>`
* **Response:**
  
```json
  {
    "notifications": [
      { "id": "123", "type": "Placement", "message": "New drive", "isRead": false, "createdAt": "2026-05-02T10:00:00Z" }
    ]
  }
  ```

**2. Mark as Read**
* **Endpoint:** `PATCH /api/v1/notifications/:id/read`
* **Response:** `{ "success": true }`

**Real-Time Notifications:**
I would use WebSockets (like Socket.io with Node.js). When a notification is generated in the backend, it emits an event directly to the connected student's socket room so it pops up on their screen instantly without needing to refresh.

---

## Stage 2: Database Storage

**Choice:** PostgreSQL.
Since notifications are strictly tied to a student, a relational database makes sense. It prevents duplicate records and keeps the relationships clean.

**Schema:**
* `id` (UUID, Primary Key)
* `studentId` (UUID, Foreign Key)
* `type` (Enum: 'Event', 'Result', 'Placement')
* `message` (Text)
* `isRead` (Boolean, default: false)
* `createdAt` (Timestamp)

**Scaling Issue:** 
As the table gets massive, queries will slow down. To fix this, we can use Table Partitioning to split the database by month. That way, the DB only searches through recent notifications instead of the entire history.

---

## Stage 3: Query Optimization

**Why is the query slow?**
It is doing a "full table scan" (checking every single row in the database) because there are no indexes to help it find unread messages quickly. 

**Is adding indexes to every column good?**
No, that's a bad idea. Every time you insert a new notification, the DB has to update every single index, which will slow down the system heavily. We only need one combined index for the fields we actually search by.

**The Fix:**
`CREATE INDEX idx_student_unread ON notifications (studentID, isRead, createdAt DESC);`

**Last 7 Days Query:**
```sql
SELECT DISTINCT studentID 
FROM notifications 
WHERE type = 'Placement' 
AND createdAt >= NOW() - INTERVAL '7 days';
```

---

## Stage 4: Performance on Page Load

**The Solution:**
We shouldn't hit the database every single time a student loads a page just to show the unread count. Instead, we should use a cache like Redis.

**How it works:**
The Node.js backend checks Redis first for the unread count. If it's there, it returns it instantly. 

**Tradeoffs:**
* **Pros:** It takes a massive amount of load off the main database and makes the app feel much faster.
* **Cons:** We have to handle cache invalidation. If a student reads a message, we have to make sure we update Redis immediately, otherwise they will see the wrong unread count on their screen.

---

## Stage 5: Bulk Notification Redesign

**The Problem:**
The loop is synchronous. It waits for the email API to finish before moving to the next student. If sending an email takes 1 second, it will take hours to notify everyone. If the loop crashes halfway through, half the students get nothing.

**The Fix:**
We need to handle this in the background using a Message Queue (like RabbitMQ or Redis Queues). 

**Revised Logic:**
```javascript
async function notifyAll(studentIds, message) {
    // 1. Save all notifications to the DB quickly in one batch
    await insertManyToDatabase(studentIds, message);
    
    // 2. Put the email jobs into a background queue
    for (let id of studentIds) {
        await queue.add('send_email', { studentId: id, message: message });
    }
}

// 3. A background worker processes the queue at its own pace
queue.process('send_email', async (job) => {
    try {
        await emailService.send(job.data.studentId, job.data.message);
    } catch (error) {
        // If an email fails, the queue will automatically retry it later
        throw new Error("Email failed, retry later");
    }
});
```

---

## Stage 6: Priority Inbox
Code for sorting the top 10 notifications by priority weight has been committed to the `notification_app_be.js` file in this repository.