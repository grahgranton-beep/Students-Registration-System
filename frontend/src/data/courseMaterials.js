export const COURSE_MATERIALS = {
  "CS101": {
    title: "Introduction to Programming",
    chapters: [
      {
        id: "intro",
        title: "1. Overview & Computer Architecture",
        content: `### 1.1 What is a Computer?
A computer consists of hardware and software. At its core, it executes simple instructions incredibly fast. It must be programmed using software to define its behavior.

*   **Processor (CPU):** The brain of the computer that carries out instructions.
*   **Memory (RAM):** Temporary storage for active data and code.
*   **I/O Ports:** Interface for peripherals (Keyboard, Mouse, Printer, Monitor).
*   **Storage (Disk):** Persistent storage (HDD/SSD/CD/DVD).

#### Simplified Architecture Diagram:
\`\`\`
[Keyboard/Mouse] ---> [ I/O Ports ] <===> [ CPU ] <===> [ Central Memory ]
                             ||
                             v
                     [ Videocard/Monitor ] <===> [ Network Adapter ]
\`\`\``
      },
      {
        id: "programming",
        title: "2. Programming & Paradigms",
        content: `### 1.4 Languages for Programming
*   **Machine Language:** Binary instructions executed directly by CPU (e.g., \`21 40 16 100\`).
*   **Assembler Language:** Low-level mnemonic codes (e.g., \`iload intRate\`).
*   **High-Level Language:** Human-readable abstraction (e.g., \`if (intRate > 100) ...\`).

### 1.5 What is a Program?
A program is composed of two fundamental parts:
1.  **Objects:** Representation of information relative to the domain of interest (data).
2.  **Operations:** Description of how to manipulate that representation to achieve functionality.

### 1.10 Programming Paradigms
*   **Imperative:** Focuses on operations as state-changing instructions.
*   **Functional:** Focuses on mathematical functions and immutable data.
*   **Object-Oriented (OO):** Focuses on objects encapsulating both data and operations.`
      },
      {
        id: "java",
        title: "3. First Java Program & Compilation",
        content: `### 1.12 The First Java Program
Java is simple, platform-independent (runs on a Virtual Machine), and safe.

\`\`\`java
import java.lang.*;

public class First {
    public static void main(String[] args) {
        System.out.println("This is my first Java program.");
    }
}
\`\`\`

#### Code Breakdown:
*   \`import java.lang.*;\`: Requests library classes (automatically imported by default).
*   \`public class First\`: Defines a class named \`First\` which must match the filename \`First.java\`.
*   \`public static void main(String[] args)\`: The entry point where program execution begins.
*   \`System.out.println(...)\`: Prints a message to the console.
*   **Case Sensitivity:** Java is case-sensitive (\`class\` is different from \`Class\`).

### 1.14 The Edit-Compile-Verify Cycle
1.  **Edit:** Write code in an editor and save as \`ClassName.java\`.
2.  **Compile:** Translate code into platform-independent bytecode using the compiler:
    \`\`\`bash
    javac ClassName.java
    \`\`\`
    This generates a \`ClassName.class\` bytecode file.
    
3.  **Execute:** Run the compiled bytecode using the Java Virtual Machine (JVM) interpreter:
    \`\`\`bash
    java ClassName
    \`\`\``
      },
      {
        id: "errors",
        title: "4. Types of Errors",
        content: `### 1.17 Errors in Programs
There are three main categories of errors encountered during development:

1.  **Syntax Errors:**
    Violations of grammar rules. Detected by the compiler.
    *Example:* Missing a semicolon \`;\` at the end of a statement.
    \`\`\`java
    System.out.println("Error here") // Compiler error: ';' expected
    \`\`\`

2.  **Semantic Errors:**
    Violations of meaning or context, making statements impossible to execute or resolve.
    *Example:* Spelling mistake in a class or variable name.
    \`\`\`java
    Sistem.out.println("Spelling mistake"); // Compiler error: package Sistem does not exist
    \`\`\`

3.  **Logical Errors:**
    The program runs without crashing but produces incorrect results.
    *Example:* Incorrect calculation or printing the wrong message.
    \`\`\`java
    // Intended to print "Hello", but prints "Goodbye"
    System.out.println("Goodbye");
    \`\`\``
      }
    ]
  },
  "SE201": {
    title: "Software Design & Patterns",
    chapters: [
      {
        id: "intro",
        title: "1. Introduction to Design Patterns",
        content: `### What is a Design Pattern?
Coined by the "Gang of Four" (GoF) in their landmark 1994 book:
*Design Patterns: Elements of Reusable Object-Oriented Software* (Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides).

> A design pattern describes a **commonly-recurring structure of communicating components** that solves a **general design problem** within a **particular context**.

It represents "best practices" and provides a shared vocabulary for software designers.

### GoF Pattern Template
A standard pattern description includes:
1.  **Name:** Intent and purpose.
2.  **Motivation:** A scenario illustrating the problem.
3.  **Applicability:** When the pattern can be applied.
4.  **Structure:** Class/object relationships (UML).
5.  **Participants & Collaborations:** Roles of classes.
6.  **Consequences:** Trade-offs and results.
7.  **Implementation:** Techniques and pitfalls.
8.  **Sample Code:** Code examples.`
      },
      {
        id: "classification",
        title: "2. Pattern Classification Matrix",
        content: `### Organization of Design Patterns
Patterns are classified by two criteria: **Purpose** (what the pattern does) and **Scope** (whether it applies to classes or objects).

| Purpose \\ Scope | Class | Object |
| :--- | :--- | :--- |
| **Creational** | Factory Method | Abstract Factory, Builder, Prototype, Singleton |
| **Structural** | Adapter (class) | Adapter (object), Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
| **Behavioral** | Interpreter, Template Method | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Visitor |`
      },
      {
        id: "behavioral",
        title: "3. Behavioral Patterns (Iterator & Strategy)",
        content: `### Iterator Pattern
*   **Intent:** Provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.
*   **UML Structure:**
    *   \`Aggregate\` defines \`CreateIterator()\`.
    *   \`Iterator\` defines interface: \`First()\`, \`Next()\`, \`IsDone()\`, \`CurrentItem()\`.
    *   \`ConcreteIterator\` tracks current position in \`ConcreteAggregate\`.

### Strategy Pattern
*   **Intent:** Encapsulates a family of algorithms, making them interchangeable. The algorithm can vary independently from the clients that use it.
*   **Example:** A text \`Document\` that needs to be formatted. The document references an \`Alignment\` strategy interface, which can be implemented by concrete classes like \`Left\`, \`Center\`, and \`Justify\`.
\`\`\`
[ Context: Document ] --alignment--> [ Strategy: Alignment ]
    + format()                               + align()
                                                ^
                                                |
                                    +-----------+-----------+
                                    |           |           |
                                 [ Left ]   [ Center ]  [ Justify ]
\`\`\``
      },
      {
        id: "structural",
        title: "4. Structural Patterns (Composite, Facade & Proxy)",
        content: `### Composite Pattern
*   **Intent:** Lets clients treat individual objects (leafs) and compositions of objects (composites) uniformly.
*   **Structure:** A \`Component\` class acts as the base. A \`Leaf\` overrides operations for individual elements. A \`Composite\` contains a list of children \`Components\` and forwards operations recursively.
*   **Example:** A graphics library where a \`Picture\` (Composite) contains multiple \`Line\` or \`Rectangle\` objects (Leafs).

### Facade Pattern
*   **Intent:** Provides a unified interface to a set of interfaces in a subsystem. A Facade defines a higher-level interface that makes the subsystem easier to use.
*   **Example:** A \`Compiler\` class acting as a Facade for internal subsystems like \`Scanner\`, \`Parser\`, \`ProgramNodeBuilder\`, and \`CodeGenerator\`.

### Proxy Pattern
*   **Intent:** Provides a surrogate or placeholder for another object to control access to it (e.g., lazy loading, remote access).
*   **Example:** An \`ImageProxy\` that returns size dimensions immediately, but only loads the full heavy \`Image\` file from disk when \`draw()\` is actually called.`
      },
      {
        id: "more",
        title: "5. Observer & Command Patterns",
        content: `### Observer Pattern
*   **Intent:** Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically (a subscription or event notification system).
*   **Participants:**
    *   \`Subject\`: Maintains a list of observers and provides methods to \`Attach()\` and \`Detach()\` them.
    *   \`Observer\`: Defines an \`Update()\` interface.
    *   \`ConcreteSubject\` triggers notification when its state changes.

### Command Pattern
*   **Intent:** Encapsulates a request as an object, thereby allowing you to parameterize clients with different requests, queue or log requests, and support undoable operations.
*   **Structure:**
    *   \`Command\` declares an \`Execute()\` operation.
    *   \`ConcreteCommand\` binds a receiver and calls its action.
    *   \`Invoker\` requests the command to carry out the request.`
      }
    ]
  },
  "SE311": {
    title: "Web Application Development",
    chapters: [
      {
        id: "intro",
        title: "1. Web Applications & Servlets",
        content: `### 17.1 Introduction
Web applications are client-server applications where the GUI is rendered by the web browser (usually via HTML/CSS/JS) and the core processing is performed on a remote Web Server.

#### Traditional CGI vs. Java Servlets
*   **Common Gateway Interface (CGI):** Executes a new process on the server for *every* incoming request. This is slow and memory-intensive.
*   **Java Servlets:** Java classes loaded into memory once by a Servlet Container (like Apache Tomcat). Each request is handled by a lightweight thread in the same process, making Servlets much faster and highly scalable.

### 17.3 What do Servlets do?
Servlets map to specific URL patterns. They intercept incoming requests, communicate with databases, write/read files, and write dynamic HTML response streams back to the browser.`
      },
      {
        id: "http",
        title: "2. HTTP Request Methods",
        content: `### 17.3.1 GET vs. POST
HTTP defines several request methods. The two most common are:

#### GET Request
*   Used to request or retrieve data from the server.
*   **Safe & Idempotent:** A GET request should never modify server state.
*   **Parameters in URL:** Form data is visible in the URL query string (e.g., \`/greetings?username=John\`).
*   **Caching:** Can be bookmarked and cached by browsers.

#### POST Request
*   Used to submit data to be processed (e.g., creating a user, placing an order).
*   **Not Safe:** Can modify server state.
*   **Parameters in Header Body:** Form data is hidden inside the HTTP request body.
*   **Caching:** Cannot be cached or bookmarked.`
      },
      {
        id: "structure",
        title: "3. Web Application Directory Layout",
        content: `### 17.4 Servlet Web App Structure
A Java Web Application (deployable as a WAR archive) must follow a standard folder structure:

\`\`\`
APPLICATION/               (Root - contains static files like index.html, CSS)
  ├── index.html
  ├── style.css
  └── WEB-INF/             (Protected metadata folder - hidden from direct URL access)
        ├── web.xml        (Deployment Descriptor - maps URLs to Servlet classes)
        ├── classes/       (Contains compiled .class files, e.g., HelloServlet.class)
        └── lib/           (Contains third-party JAR dependencies, e.g., mysql-connector.jar)
\`\`\`

#### Sample Deployment Descriptor (web.xml):
\`\`\`xml
<web-app>
  <servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>HelloServlet</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>hello</servlet-name>
    <url-pattern>/hello</url-pattern>
  </servlet-mapping>
</web-app>
\`\`\``
      },
      {
        id: "code",
        title: "4. Writing a Servlet",
        content: `### 17.5 Your First Servlet
Here is a basic Java Servlet that handles a GET request and returns HTML:

\`\`\`java
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class HelloServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Retrieve parameters from form input
        String name = request.getParameter("username");
        if (name == null || name.trim().equals("")) {
            name = "World";
        }

        // Set response content type
        response.setContentType("text/html");

        // Write HTML response stream
        PrintWriter out = response.getWriter();
        out.println("<html>");
        out.println("<head><title>Hello Servlet</title></head>");
        out.println("<body>");
        out.println("<h1>Hello, " + name + "!</h1>");
        out.println("<p>It is good to meet you.</p>");
        out.println("</body>");
        out.println("</html>");
    }
}
\`\`\`

### 17.11 Servlet Lifecycle
A servlet's life cycle is managed by the servlet container (Tomcat):
1.  **Instantiation & Loading:** The container reads \`web.xml\` and loads the servlet class.
2.  **Initialization:** The container calls the \`init()\` method (runs only once). Excellent place to initialize database connections.
3.  **Service:** The container calls the \`service()\` method for each request, which dispatches to \`doGet()\` or \`doPost()\`.
4.  **Destroy:** The container calls \`destroy()\` before removing the servlet from memory (runs once).`
      },
      {
        id: "sessions",
        title: "5. Cookies & Session Tracking",
        content: `### 17.7 Cookies
A cookie is a small text file sent by the server and stored on the client's browser. It is returned to the server with every HTTP request.
*   **Create Cookie:** \`Cookie cookie = new Cookie("visited", "true");\`
*   **Expiration:** \`cookie.setMaxAge(60 * 60 * 24);\` (1 day).
*   **Add to Response:** \`response.addCookie(cookie);\`

### 17.8 The Session Tracking API (HttpSession)
Since cookies can be disabled by users, the Servlet API provides \`HttpSession\` to maintain state securely on the server. It automatically generates a unique Session ID (typically stored in a session cookie called \`JSESSIONID\`).

#### Using Sessions:
\`\`\`java
// Get the current session, create one if it doesn't exist
HttpSession session = request.getSession();

// Store user data in session
session.setAttribute("username", "JohnDoe");

// Retrieve user data in another request
String user = (String) session.getAttribute("username");
\`\`\`

### 17.9 Response Status Codes
*   **200 OK:** Request succeeded.
*   **403 Forbidden:** Access denied.
*   **404 Not Found:** Page or resource does not exist.
*   **500 Internal Server Error:** Exception thrown during server execution.`
      }
    ]
  },
  "SE321": {
    title: "Database Systems & SQL",
    chapters: [
      {
        id: "intro",
        title: "1. Introduction & SQL Categories",
        content: `### What is SQL?
Structured Query Language (SQL) is the standard language used to define, query, and manipulate relational database management systems (RDBMS).

### Major SQL Subdivisions:
1.  **DDL (Data Definition Language):** Defines and structures tables and database objects.
    *   \`CREATE TABLE\`, \`ALTER TABLE\`, \`DROP TABLE\`
2.  **DML (Data Manipulation Language):** Allows querying and updating records.
    *   \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\`
3.  **DCL (Data Control Language):** Controls access privileges and transaction commits.
    *   \`GRANT\`, \`REVOKE\`, \`COMMIT\`, \`ROLLBACK\`

### Example Company Database Schema:
*   **DEPT Table:**
    - \`DEPTNO\` (PK - Department Number)
    - \`DNAME\` (Department Name)
    - \`LOC\` (Location - e.g. Chicago, New York)
*   **EMP Table:**
    - \`EMPNO\` (PK - Employee Number)
    - \`ENAME\` (Employee Name)
    - \`JOB\` (e.g. CLERK, SALESMAN, MANAGER)
    - \`MGR\` (Manager's EMPNO)
    - \`HIREDATE\` (Hire Date)
    - \`SAL\` (Monthly Salary)
    - \`COMM\` (Commission - can be NULL)
    - \`DEPTNO\` (FK referencing DEPT.DEPTNO)`
      },
      {
        id: "select",
        title: "2. SELECT & WHERE Queries",
        content: `### The SQL SELECT Statement
The basic format to retrieve data:
\`\`\`sql
SELECT column1, column2 FROM tableName;
\`\`\`

#### Shorthand Asterisk (\`*\`):
Retrieves all columns. Generally avoided in production to preserve bandwidth and adapt to schema changes:
\`\`\`sql
SELECT * FROM DEPT;
\`\`\`

#### Calculated Columns & Column Aliases:
SQL calculations are performed on-the-fly. Aliases rename column headers for output readability:
\`\`\`sql
SELECT EMPNO, ENAME, 12 * (SAL + COMM) AS "ANNUAL INCOME" FROM EMP;
\`\`\`

### Filtering with WHERE Clause
Filters rows matching specified conditions:
\`\`\`sql
SELECT ENAME, JOB, SAL FROM EMP
WHERE JOB = 'SALESMAN' AND SAL > 1500;
\`\`\`

#### WHERE Conditions:
*   **Comparisons:** \`=\`, \`!=\` (or \`<>\`), \`<\`, \`>\`, \`<=\`, \`>=\`
*   **List Search:** \`WHERE DEPTNO IN (10, 20)\`
*   **Range Search:** \`WHERE SAL BETWEEN 1000 AND 2000\` (inclusive)
*   **Pattern Matching (LIKE):** Uses wildcards:
    *   \`%\` matches zero or more characters (e.g., \`LIKE 'S%'\` matches "SMITH", "SCOTT").
    *   \`_\` matches exactly one character (e.g., \`LIKE 'S__'\` matches "SUN", but not "SMITH").`
      },
      {
        id: "sort_null",
        title: "3. Sorting & Handling NULLs",
        content: `### Sorting Data (ORDER BY)
Rows are sorted using the \`ORDER BY\` clause. It must be the final clause of the query:
*   \`ASC\`: Sorts in ascending order (default).
*   \`DESC\`: Sorts in descending order.

\`\`\`sql
SELECT EMPNO, ENAME, DEPTNO FROM EMP
ORDER BY DEPTNO ASC, ENAME DESC;
\`\`\`

### Handling NULL Values
A \`NULL\` value represents the absence of a value. It is not equivalent to zero or a space.

#### IS NULL Operators:
Do not use \`= NULL\`; use \`IS NULL\` or \`IS NOT NULL\`:
\`\`\`sql
SELECT ENAME, SAL FROM EMP
WHERE COMM IS NULL;
\`\`\`

#### The NVL Function:
Replaces a NULL value with a default value during retrieval:
\`\`\`sql
-- If COMM is NULL, treats it as 0. Otherwise returns the COMM value.
SELECT ENAME, SAL, NVL(COMM, 0) AS COMMISSION FROM EMP;
\`\`\`
*Note: In MySQL, this function is called \`IFNULL()\` or \`COALESCE()\` while \`NVL()\` is standard in Oracle.*`
      },
      {
        id: "functions",
        title: "4. SQL Built-in Functions",
        content: `### Arithmetic Functions
*   \`round(number, decimals)\`: Rounds to decimal places. E.g. \`round(sal, 2)\`.
*   \`trunc(number, decimals)\`: Truncates digits.
*   \`abs(x)\`: Returns absolute value.
*   \`sqrt(x)\`: Returns square root.
*   \`ceil(x)\` / \`floor(x)\`: Rounds up / down to nearest integer.

### Character Functions
*   \`string1 || string2\`: Concatenation (In MySQL: \`CONCAT(string1, string2)\`).
*   \`length(str)\`: Returns character count.
*   \`upper(str)\` / \`lower(str)\`: Case conversion.
*   \`substr(str, start_pos, length)\`: Extracts substring. E.g. \`substr('ename', 1, 3)\`.
*   \`lpad(str, len, pad_char)\` / \`rpad(str, len, pad_char)\`: Padding on left/right.

### Date Functions
*   \`Sysdate\`: Returns system date.
*   \`add-months(date, n)\`: Adds n months.
*   \`months-between(d1, d2)\`: Months difference.
*   \`to_char(date, format)\`: Formats date. E.g. \`to_char(Sysdate, 'dd/mon/yyyy')\`.

### Aggregate Functions
Operate on multiple rows and return a single summary value:
*   \`sum(col)\`, \`avg(col)\`, \`min(col)\`, \`max(col)\`
*   \`count(col)\`: Counts non-null rows.
*   \`count(*)\`: Counts all rows (including nulls).`
      }
    ]
  },
  "SE401": {
    title: "Advanced Agentic Coding",
    chapters: [
      {
        id: "intro",
        title: "1. What is Agentic Coding?",
        content: `### The Shift in Software Engineering
Agentic coding is a software development paradigm where AI agents actively participate in the coding process as autonomous contributors, rather than simple autocomplete features.

*   **AI-Powered Assistance:** Agents understand project context and user intent.
*   **Interactive Development:** Real-time collaboration between developer and AI.
*   **Task-Oriented:** Agents complete complex, multi-step actions (e.g. writing files, running tests, resolving dependencies).
*   **Context Awareness:** Deep codebase-level understanding.

Rather than just suggesting code completions, agents actively participate in **planning, implementation, and refinement** of solutions.`
      },
      {
        id: "tools",
        title: "2. Core Tools (Cursor vs. Claude Code)",
        content: `### IDE Chat vs. Terminal Agents

| Feature | IDE Assistants (e.g., Cursor) | Terminal Agents (e.g., Claude Code) |
| :--- | :--- | :--- |
| **Interface** | Embedded sidebar, chat windows. | Runs directly in terminal shell. |
| **Tool Execution** | Recommends code; user copies/pastes. | Autonomously reads/writes files & runs terminal commands. |
| **Permissions** | Sandboxed to IDE. | Supports yolo mode (\`--dangerously-skip-permissions\`). |
| **Iteration** | Single-turn suggestions. | Multi-turn loops (fixes bugs by running tests, reading logs). |

#### Other Ecosystem Tools:
*   **OpenCode:** Open-source AI development.
*   **Gemini CLI:** Google's terminal assistant (perfect for large-context code summarization).
*   **MCP (Model Context Protocol):** Protocol to expose local tools (browsers, databases) directly to LLMs.`
      },
      {
        id: "principles",
        title: "3. Workflow Principles",
        content: `### Simplicity, Ecosystems & Context
Building an environment that is optimized for agentic coding significantly boosts productivity.

#### 1. Language & Ecosystem Choice:
*   **Simplicity Helps:** Simple languages (Go, PHP, basic Python) work best. Low-churn ecosystems preserve the agent's knowledge base.
*   **Long function names beat namespaces:** Helps agents find references without depending heavily on the Language Server Protocol (LSP).

#### 2. Conserve Context:
*   **Prevent Spelunking:** Limit the agent's search paths. Do not feed it massive log dumps.
*   **Keep Instructions Short:** A concise \`CLAUDE.md\` is much better than a 1000-line directive.
*   **Model Specialization:** Use high-context models (like Gemini) to summarize codebases or plan architecture, and fast code-models (like Claude) for inline refactoring.

#### 3. Enable Forward Progress:
*   **Maintain a Clean Environment:** A pre-broken development environment will confuse the agent and cause backtracking.
*   **Actionable Test Runners:** Ensure tests fail with clean, structured outputs so agents can parse errors.`
      },
      {
        id: "tips",
        title: "4. Practical Tips for Agents",
        content: `### Four Key Developer Tips

#### Tip 1: Unified Logging
Combine frontend console logs, server console, and database logs into a single, tailable file. Provide a shortcut (e.g. \`make tail-logs\`) so the agent can monitor outputs in real time.

#### Tip 2: Multi-Process Guidance
Document how your distributed services start up, their dependencies, and how to verify their health. Don't make the agent guess startup order.

#### Tip 3: Synchronization Points
Give agents an await mechanism to handle asynchronous actions. For example:
\`\`\`bash
# Block agent execution until background preprocessing finishes
make await POINT=event-preprocessing-done
\`\`\`

#### Tip 4: CI Debugging Access
Give the agent access to the GitHub CLI (\`gh\`). Let it retrieve CI build logs, create branches, and push Pull Requests directly when resolving issues.`
      }
    ]
  }
};
