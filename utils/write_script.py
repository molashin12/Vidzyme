import re
from utils.gemini import query

def get_title():
    topic = input("Topic name: ")
    while True:
        print("Generating titles...")
        data = query(f"Give me 5 YouTube Shorts titles related to the topic '{topic}' separated by commas")
        if data:
            # Split text using English or Arabic comma
            titles = re.split(r'[,،]', data["candidates"][0]["content"]["parts"][0]["text"])
            # Remove extra spaces and ensure each title is not empty
            titles = [t.strip() for t in titles if t.strip()]
            # Add topic as additional option if desired
            titles.append(topic)
            for i in range(len(titles)):
                print(str(i) + " : " + titles[i])
            choice = int(input("Enter your choice from the titles: "))
            if choice == -1:
                continue
            print("Title obtained!")
            with open("./outputs/title.txt", "w", encoding='utf-8') as f:
                f.write(titles[choice])
            return titles[choice]
        else:
            print("Fatal error :(")
            exit()

def get_content(title):
    while True:
        data = query(f"Explain this topic '{title}' briefly in one minute. Be creative.")
        if data:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            print(content)
            print("\n" + "="*50 + "\n")
            satisfied = input("Does this suit you? (yes/no): ")
            if satisfied != "no":
                return content
            else:
                continue
        else:
            print("Fatal error :(")
            exit()

def write_content(content):
    with open("./outputs/text.txt", "w", encoding='utf-8') as f:
        f.write(content)

def split_text_to_lines():
    with open("./outputs/text.txt", "r", encoding="utf-8") as f:
        text_input = f.read()
    text_input = text_input.replace(':',' ').replace('-',' ').replace('_'," ").replace('!','.').replace('*',"").replace(',','.')
    with open("./outputs/line_by_line.txt", "w", encoding="utf-8") as f_out:
        for line in text_input.strip().split("\n"):
            for sentence in line.split('.'):
                sentence = sentence.strip()
                if sentence:
                    f_out.write(sentence + "\n")

if __name__ == "__main__":
    write_content(get_content(get_title()))
