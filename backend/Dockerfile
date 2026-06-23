# Use a stable, lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set up a new user named "user" with UID 1000
RUN useradd -m -u 1000 user

# Set the working directory to /code
WORKDIR /code

# Copy requirements.txt first to take advantage of Docker caching
COPY --chown=user requirements.txt /code/requirements.txt

# Install dependencies as the non-root user
USER user
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the remaining application source code
COPY --chown=user . /code

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

# Command to run the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]







